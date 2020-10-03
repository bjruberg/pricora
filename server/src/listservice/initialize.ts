import { difference, find, forEach, intersection, map } from "lodash";
import { getRepository } from "typeorm";

import { Meeting } from "../entity/Meeting";
import { User } from "../entity/User";
import { Meta } from "../entity_meeting/Meta";
import { Secret } from "../entity_meeting/Secret";
import { sourcePlugin } from "./plugin";

export const init = async (): Promise<void> => {
  const meetingRepo = getRepository(Meeting);
  const userRepo = getRepository(User);
  const usersQuery = userRepo.find({ select: ["id", "email"] });
  const [meetings, filenames] = await Promise.all([
    meetingRepo
      .createQueryBuilder("meeting")
      .select("meeting.id")
      .getMany()
      .then((meetings) => map(meetings, "id")),
    sourcePlugin
      .getMeetingFileList()
      .then((files) => map(files, (filename) => filename.split(".").slice(0, -1).join("."))),
  ]);

  // const meetingsOnlyInDatabase = difference(meetings, filenames);
  const meetingsOnlyInFiles = difference(filenames, meetings);
  const meetingsBothFound = intersection(filenames, meetings);
  sourcePlugin.createConnections(meetingsBothFound);

  const users = await usersQuery;
  // reconstruct meeting in database from meeting file
  forEach(meetingsOnlyInFiles, async (meetingOnlyAsFileUuid) => {
    try {
      const connection = await sourcePlugin.createConnection(meetingOnlyAsFileUuid);
      const metaInfo = await connection.manager.findOne(Meta);
      const secrets = await connection.manager.find(Secret);

      // check whether there is a secret that we have a user for
      const matchingUsers = intersection(map(secrets, "user_email"), map(users, "email"));

      if (metaInfo && matchingUsers.length > 0) {
        const foundUser = find(users, { email: matchingUsers[0] });
        const newMeeting = meetingRepo.create();
        newMeeting.id = meetingOnlyAsFileUuid;
        newMeeting.title = metaInfo.title;
        newMeeting.date = metaInfo.date;
        newMeeting.userId = foundUser.id;
        void meetingRepo.save(newMeeting);
      }
    } catch (e) {
      console.log(`Failed to import meeting file ${meetingOnlyAsFileUuid}`);
      console.log(e);
    }
  });
};

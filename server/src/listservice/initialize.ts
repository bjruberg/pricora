import { difference, intersection, map } from "lodash";
import { getRepository } from "typeorm";

import { Meeting } from "../entity/Meeting";
import { sourcePlugin } from "./plugin";

export const init = async (): Promise<void> => {
  const meetingRepo = getRepository(Meeting);
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

  const meetingsOnlyInDatabase = difference(meetings, filenames);
  // const meetingsUnknown = difference(filenames, meetings);
  const meetingsExpected = intersection(filenames, meetings);
  sourcePlugin.createConnections([...meetingsOnlyInDatabase, ...meetingsExpected]);
};

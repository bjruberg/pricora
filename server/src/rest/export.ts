import { AuthorizedContext } from "koa";
import { format } from "date-fns";
import { writeToBuffer } from "@fast-csv/format";
import { snakeCase } from "lodash";

import { decryptMeeting } from "../resolvers/meeting";
import { Meeting } from "../entity/Meeting";

export const exportMeeting = async (ctx: AuthorizedContext): Promise<void> => {
  const meetingId = ctx.query.id;
  const meeting = await ctx.db.manager.findOne(Meeting, { id: meetingId });

  if (!meeting) {
    ctx.throw("Meeting does not exist");
  }

  const decryptedMeeting = await decryptMeeting(ctx, meetingId);

  ctx.response.attachment(
    `exportedMeeting-${format(new Date(meeting.created), "yyyy-mm-dd")}-${snakeCase(
      meeting.title,
    )}.csv`,
  );

  ctx.body = await writeToBuffer(decryptedMeeting, {
    headers: ["firstName", "lastName", "address", "zip", "city", "country", "created"],
    writeBOM: true,
  });
};

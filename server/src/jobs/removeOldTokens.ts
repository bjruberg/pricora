/* eslint-disable @typescript-eslint/no-var-requires */
import { MeetingToken } from "../entity/MeetingToken";
import { sub } from "date-fns";
import { getConnection } from "typeorm";

const run = (): void => {
  const connection = getConnection();
  const dateTreshold = sub(new Date(), { hours: 2 });

  // see: https://github.com/typeorm/typeorm/issues/2286
  const correctedDateForTypeOrmBug = dateTreshold.toISOString().replace("T", " ");

  const query = connection
    .createQueryBuilder()
    .delete()
    .from(MeetingToken)
    .where("created < :nowBeforeTwoHours", { nowBeforeTwoHours: correctedDateForTypeOrmBug });

  void query.execute();
};

export default run;

import { decryptDataUsingKey, encryptDataUsingKey, generateIV } from "./../utils/encryption";
import { sub } from "date-fns";
import { forEach, map, mapValues } from "lodash";
import { AuthorizedContext } from "koa";
import { config } from "node-config-ts";
import { Ctx, Resolver, Query, Arg, Mutation, Authorized, FieldResolver, Root } from "type-graphql";
import { Connection, getConnection, getRepository, MoreThan, Not } from "typeorm";

import { sourcePlugin } from "../listservice/plugin";
import { Meta } from "../entity_meeting/Meta";
import { Entry, EntryInput } from "../entity_meeting/Entry";
import { Secret } from "../entity_meeting/Secret";
import { Meeting, MeetingInput, Attendants } from "../entity/Meeting";
import { MeetingToken } from "../entity/MeetingToken";
import { User } from "../entity/User";
import { getKey } from "../keys";

import { exportKey, generateKeyPair, generateSecret } from "../utils/encryption";
import { privateDecrypt, publicEncrypt } from "crypto";
import { createSecret } from "../listservice/secret";

export const decryptMeeting = async (
  ctx: AuthorizedContext,
  meetingId: string,
): Promise<Omit<Entry, "encryptedRowSecret" | "encryptionIV">[]> => {
  const connection = await sourcePlugin.getConnection(meetingId);

  if (!connection) {
    throw new Error("Requested meeting is not available");
  }

  const entryRepo = connection.getRepository(Entry);
  const entries = await entryRepo.find({ order: { created: "DESC" } });

  const secretRep = connection.getRepository(Secret);
  const secret = await secretRep.findOne({
    where: [{ user_id: ctx.user.id }, { user_email: ctx.user.email }],
  });

  if (!secret) {
    throw new Error("User has no secret for this meeting");
  }

  const userSecret = await getKey(ctx.user.id);

  if (!userSecret) {
    throw new Error("Need to relogin to unlock user secret");
  }

  const meetingDecryptionKey = decryptDataUsingKey(
    userSecret,
    secret.encryptionIV,
    secret.encryptedDecriptionKey,
  );

  const decryptedEntries = map(entries, (entry) => {
    const { created, encryptedRowSecret, encryptionIV, id, ...encryptedValues } = entry;
    const rowSecret = privateDecrypt(meetingDecryptionKey, Buffer.from(encryptedRowSecret, "hex"));
    return {
      created: new Date(created).toISOString(),
      id,
      ...mapValues(encryptedValues, (encryptedData) => {
        try {
          return decryptDataUsingKey(rowSecret, encryptionIV, encryptedData);
        } catch (e) {
          return "<Decryption failure>";
        }
      }),
    };
  });

  return decryptedEntries;
};

@Resolver(() => Meeting)
export class MeetingResolver {
  constructor(
    // constructor injection of a service
    private readonly meetingRepo = getRepository(Meeting),
    private readonly userRepo = getRepository(User),
  ) {
    // pass
  }

  @Authorized()
  @Query(() => [Meeting])
  meetings(): Promise<Meeting[]> {
    return this.meetingRepo.find({
      where: {
        // see: https://github.com/typeorm/typeorm/issues/2286
        date: MoreThan(sub(new Date(), { weeks: 3 }).toISOString().replace("T", " ")),
      },
    });
  }

  @Authorized("ATTENDANT")
  @Query(() => Meeting)
  async meeting(@Arg("id") id: string, @Ctx() ctx: AuthorizedContext): Promise<Meeting> {
    const meeting = await this.meetingRepo.findOne({ id });

    if (!meeting) {
      ctx.throw(`Failed to find the meeting ${id} in the local database`, 400);
    }

    if (ctx.request.query.auth) {
      // user has probably authorized via meetingToken
      const meetingToken = await (await ctx.db).manager.findOne(MeetingToken, {
        id: ctx.request.query.auth,
      });
      if (!meetingToken || meetingToken.meetingId !== id) {
        // We have a valid access token - but for another meeting
        ctx.throw("You do not have the authorization to add attendants to this meeting", 401);
      }
    }

    return meeting;
  }

  @Authorized()
  @Mutation(() => Meeting)
  async createMeeting(
    @Arg("input") input: MeetingInput,
    @Ctx() ctx: AuthorizedContext,
  ): Promise<Meeting> {
    const connection = getConnection();
    const queryRunner = connection.createQueryRunner();
    const meeting = this.meetingRepo.create({ ...input });
    const user = await this.userRepo.findOne(ctx.user.id);
    const adminQuery = this.userRepo.find({ where: { isAdmin: true, id: Not(ctx.user.id) } });

    if (!user) {
      ctx.throw("Authorized user not found in database", 406);
    }
    meeting.user = Promise.resolve(user);

    let newDbConnection: Connection;

    const userSecret = await getKey(user.id);

    if (!userSecret) {
      ctx.throw("Need to relogin to unlock user secret");
    }

    const keyPairGeneration = generateKeyPair(4096);
    await queryRunner.startTransaction();
    const newMeeting = await queryRunner.manager.save(meeting);

    try {
      newDbConnection = await sourcePlugin.addMeeting(newMeeting.id);
    } catch (e) {
      console.error(e);
      ctx.throw("Failed to save the meeting", 500);
    }

    const {
      publicKey: meetingEncryptionKey,
      privateKey: meetingDecryptionKey,
    } = await keyPairGeneration;

    const newQueryRunner = newDbConnection.createQueryRunner();
    await newQueryRunner.startTransaction();

    const metadata = newQueryRunner.manager.create(Meta);
    metadata.date = input.date;
    metadata.cipher = config.encryption.cipher;
    metadata.encryptionKey = exportKey(meetingEncryptionKey);
    metadata.title = input.title;

    const exportedDecryptionKey = exportKey(meetingDecryptionKey);

    await createSecret(user, userSecret, exportedDecryptionKey, newQueryRunner.manager);

    forEach(await adminQuery, async (admin) => {
      const adminSecret = await getKey(admin.id);
      if (adminSecret) {
        await createSecret(admin, adminSecret, exportedDecryptionKey, newQueryRunner.manager);
      }
    });

    try {
      await newQueryRunner.manager.save(metadata);
      await Promise.all([queryRunner.commitTransaction(), newQueryRunner.commitTransaction()]);
    } catch (err) {
      await queryRunner.rollbackTransaction();
      await newQueryRunner.rollbackTransaction();
      ctx.throw("Creating the meeting failed");
    } finally {
      await queryRunner.release();
      await newQueryRunner.release();
    }

    return newMeeting;
  }

  @Authorized()
  @Mutation(() => Boolean)
  async deleteMeeting(
    @Arg("meeting") uuid: string,
    @Ctx() ctx: AuthorizedContext,
  ): Promise<boolean> {
    const db = await ctx.db;
    const meeting = await db.manager.findOne(Meeting, { id: uuid });

    if (!(meeting.userId === ctx.user.id) && !ctx.user.isAdmin) {
      ctx.throw("You have not rights to delete this meeting");
    }

    await db.manager.delete(Meeting, { id: uuid });

    await sourcePlugin.deleteMeeting(uuid);

    return true;
  }

  @Authorized("ATTENDANT")
  @Mutation(() => Boolean)
  async addAttendant(
    @Arg("input") input: EntryInput,
    @Arg("meeting") uuid: string,
    @Ctx() ctx: AuthorizedContext,
  ): Promise<boolean> {
    const [meeting, connection] = await Promise.all([
      getConnection().manager.findOne(Meeting, { id: uuid }),
      sourcePlugin.getConnection(uuid),
    ]);

    if (!meeting || !connection) {
      ctx.throw("Requested meeting is not available for addition", 412);
    }

    if (ctx.request.query.auth) {
      // user has probably authorized via meetingToken
      const meetingToken = await getConnection().manager.findOne(MeetingToken, {
        id: ctx.request.query.auth,
      });
      if (!meetingToken || meetingToken.meetingId !== uuid) {
        // We have a valid access token - but for another meeting
        ctx.throw("You do not have the authorization to add attendants to this meeting", 401);
      }
    }

    const queryRunner = connection.createQueryRunner();

    await queryRunner.startTransaction();

    try {
      const metadata = await queryRunner.manager.findOne(Meta);

      if (!metadata) {
        ctx.throw("Database file for meeting is invalid", 500);
      }

      const rowSecret = await generateSecret();
      const generatedInitializationVector = await generateIV();

      // encrypt all user data
      const encryptedInput = mapValues(input, (value) =>
        encryptDataUsingKey(rowSecret, generatedInitializationVector, value),
      );

      const entry = queryRunner.manager.create(Entry, encryptedInput);

      entry.encryptionIV = generatedInitializationVector;
      entry.encryptedRowSecret = publicEncrypt(metadata.encryptionKey, rowSecret).toString("hex");

      await queryRunner.manager.save(entry);
      await queryRunner.commitTransaction();

      if (meeting) {
        meeting.numberOfAttendants = meeting.numberOfAttendants + 1;
        void getConnection().manager.save(meeting);
      }
    } catch (err) {
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }

    return sourcePlugin.updated(uuid).then(() => true);
  }

  @Authorized()
  @Mutation(() => Boolean)
  async deleteAttendant(
    @Arg("meetingId") meetingId: string,
    @Arg("attendantId") attendantId: string,
    @Ctx() ctx: AuthorizedContext,
  ): Promise<boolean> {
    const meeting = await (await ctx.db).manager.findOne(Meeting, { id: meetingId });

    if (!(meeting.userId === ctx.user.id) && !ctx.user.isAdmin) {
      ctx.throw("You have no rights to delete attendents from this meeting");
    }

    const connection = await sourcePlugin.getConnection(meetingId);
    await connection.manager.delete(Entry, { id: attendantId });

    return sourcePlugin.updated(meetingId).then(() => true);
  }

  @Authorized()
  @Mutation(() => String)
  async createAuthToken(
    @Arg("meetingId") id: string,
    @Ctx() ctx: AuthorizedContext,
  ): Promise<string> {
    const db = await ctx.db;

    const token = db.manager.create(MeetingToken);
    token.meetingId = id;

    const createdToken = await db.manager.save(token);
    return createdToken.id;
  }

  @FieldResolver(() => Attendants)
  async attendants(@Root() meeting: Meeting, @Ctx() ctx: AuthorizedContext): Promise<Attendants> {
    return decryptMeeting(ctx, meeting.id).then(
      (list) => {
        return {
          list,
          error: "",
        };
      },
      (err) => {
        return {
          list: [],
          error: String(err),
        };
      },
    );
  }
}

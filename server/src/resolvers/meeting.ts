import { decryptDataUsingKey, encryptDataUsingKey, generateIV } from "./../utils/encryption";
import { forEach, map, mapValues } from "lodash";
import { AuthorizedContext } from "koa";
import { config } from "node-config-ts";
import { Ctx, Resolver, Query, Arg, Mutation, Authorized, FieldResolver, Root } from "type-graphql";
import { Connection, getConnection, getRepository } from "typeorm";

import { sourcePlugin } from "../listservice/plugin";
import { Meta } from "../entity_meeting/Meta";
import { Entry, EntryInput, EntryOutput } from "../entity_meeting/Entry";
import { Secret } from "../entity_meeting/Secret";
import { Meeting, MeetingInput } from "../entity/Meeting";
import { User } from "../entity/User";
import { getKey } from "../keys";

import { exportKey, generateKeyPair, generateSecret } from "../utils/encryption";
import { privateDecrypt, publicEncrypt } from "crypto";

export const decryptMeeting = async (
  ctx: AuthorizedContext,
  meetingId: string,
): Promise<Omit<Entry, "encryptedRowSecret" | "encryptionIV">[]> => {
  const connection = await sourcePlugin.getConnection(meetingId);

  if (!connection) {
    ctx.throw("Requested meeting is not available", 412);
  }

  const entryRepo = connection.getRepository(Entry);
  const entries = await entryRepo.find();

  const secretRep = connection.getRepository(Secret);
  const secret = await secretRep.findOne({ user_id: ctx.user.id });

  if (!secret) {
    ctx.throw("User has no secret for this meeting", 401);
  }

  const userSecret = await getKey(ctx.user.id);

  if (!userSecret) {
    ctx.throw("Need to relogin to unlock user secret", 401);
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
    return this.meetingRepo.find();
  }

  @Authorized()
  @Query(() => Meeting)
  async meeting(@Arg("id") id: string, @Ctx() ctx: AuthorizedContext): Promise<Meeting> {
    const meeting = await this.meetingRepo.findOne({ id });
    if (!meeting) {
      ctx.throw(`Failed to find the meeting ${id} in the local database`, 400);
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
    const adminQuery = this.userRepo.find({ isAdmin: true });

    if (!user) {
      ctx.throw("Authorized user not found in database", 406);
    }
    meeting.user = Promise.resolve(user);

    let newDbConnection: Connection;
    let newMeeting: Meeting;

    try {
      newMeeting = await queryRunner.manager.save(meeting);
      newDbConnection = await sourcePlugin.addMeeting(meeting.id);
    } catch (e) {
      ctx.throw("Failed to save the meeting", 500);
    }

    const userSecret = await getKey(user.id);

    if (!userSecret) {
      ctx.throw("Need to relogin to unlock user secret");
    }

    const {
      publicKey: meetingEncryptionKey,
      privateKey: meetingDecryptionKey,
    } = await generateKeyPair(4096);

    const generatedIV = await generateIV();

    const newQueryRunner = newDbConnection.createQueryRunner();

    const metadata = newQueryRunner.manager.create(Meta);
    metadata.date = input.date;
    metadata.cipher = config.encryption.cipher;
    metadata.encryptionKey = exportKey(meetingEncryptionKey);
    metadata.title = input.title;

    const newSecret = newQueryRunner.manager.create(Secret);

    const exportedDecryptionKey = exportKey(meetingDecryptionKey);

    newSecret.encryptionIV = generatedIV;
    newSecret.encryptedDecriptionKey = encryptDataUsingKey(
      userSecret,
      generatedIV,
      exportedDecryptionKey,
    );
    newSecret.user_id = user.id;

    await queryRunner.startTransaction();
    await newQueryRunner.startTransaction();

    forEach(await adminQuery, async (admin) => {
      const adminSecret = await getKey(admin.id);
      if (adminSecret) {
        const adminSecretRow = newQueryRunner.manager.create(Secret);
        adminSecretRow.encryptionIV = generatedIV;
        adminSecretRow.encryptedDecriptionKey = encryptDataUsingKey(
          adminSecret,
          generatedIV,
          exportedDecryptionKey,
        );
        adminSecretRow.user_id = admin.id;
        void newQueryRunner.manager.save(adminSecretRow);
      }
    });

    try {
      void newQueryRunner.manager.save(metadata);
      void newQueryRunner.manager.save(newSecret);

      await Promise.all([queryRunner.commitTransaction(), newQueryRunner.commitTransaction()]);
    } catch (err) {
      await queryRunner.rollbackTransaction();
      await newQueryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
      await newQueryRunner.release();
    }

    return newMeeting;
  }

  @Authorized()
  @Mutation(() => Boolean)
  async addAttendant(
    @Arg("input") input: EntryInput,
    @Arg("meeting") uuid: string,
    @Ctx() ctx: AuthorizedContext,
  ): Promise<boolean> {
    const connection = await sourcePlugin.getConnection(uuid);

    if (!connection) {
      ctx.throw("Requested meeting is not available for addition", 412);
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

      const meeting = await getConnection().manager.findOne(Meeting, { id: uuid });
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

  @FieldResolver(() => [EntryOutput])
  async attendants(
    @Root() meeting: Meeting,
    @Ctx() ctx: AuthorizedContext,
  ): Promise<EntryOutput[]> {
    return decryptMeeting(ctx, meeting.id);
  }
}

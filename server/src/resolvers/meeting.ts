import { sourcePlugin } from "./../dataservice/plugin";
import { AuthorizedContext } from "koa";
import { Ctx, Field, InputType, Resolver, Query, Arg, Mutation, Authorized } from "type-graphql";
import { getRepository } from "typeorm";

import { Entry, EntryInput } from "../entity_meeting/Entry";
import { Meeting } from "../entity/Meeting";
import { User } from "../entity/User";

@InputType()
export class CreateMeetingInput {
  @Field()
  title: string;
}

@Resolver()
export class MeetingResolver {
  constructor(
    // constructor injection of a service
    private readonly meetingRepo = getRepository(Meeting),
    private readonly userRepo = getRepository(User),
  ) {
    // pass
  }

  @Query(() => [Meeting])
  meetings(): Promise<Meeting[]> {
    return this.meetingRepo.find();
  }

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
    @Arg("input") input: CreateMeetingInput,
    @Ctx() ctx: AuthorizedContext,
  ): Promise<Meeting> {
    const meeting = this.meetingRepo.create({ ...input });
    const user = await this.userRepo.findOne(ctx.user.id);

    if (!user) {
      ctx.throw("Authorized user not found in database", 406);
    }
    meeting.user = Promise.resolve(user);

    try {
      const newMeeting = await this.meetingRepo.save(meeting);
      void sourcePlugin.addMeeting(meeting.id);
      return newMeeting;
    } catch (e) {
      ctx.throw("Failed to save the meeting", 500);
    }
  }

  @Authorized()
  @Mutation(() => Boolean)
  async addAttendant(
    @Arg("input") input: EntryInput,
    @Arg("meeting") uuid: string,
    @Ctx() ctx: AuthorizedContext,
  ): Promise<boolean> {
    const connection = sourcePlugin.getConnection(uuid);

    if (!connection) {
      ctx.throw("Requested meeting is not available for addition");
    }

    const entryRepo = (await connection).getRepository(Entry);
    const entry = entryRepo.create(input);
    await entryRepo.save(entry);

    return sourcePlugin.updated(uuid).then(() => true);
  }
}

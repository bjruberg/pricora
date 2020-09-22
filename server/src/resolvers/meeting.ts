import { AuthorizedContext } from "koa";
import { Ctx, Field, InputType, Resolver, Query, Arg, Mutation, Authorized } from "type-graphql";
import { getRepository } from "typeorm";

import { Meeting } from "../entity/Meeting";
import { User } from "../entity/User";
import { sourcePlugin } from "../dataservice/plugin";

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
}

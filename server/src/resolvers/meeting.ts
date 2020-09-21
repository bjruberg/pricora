import { AuthorizedContext } from "koa";
import { Ctx, Field, InputType, Resolver, Query, Arg, Mutation, Authorized } from "type-graphql";
import { getRepository } from "typeorm";

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

  @Authorized()
  @Mutation(() => Meeting)
  async createMeeting(
    @Arg("input") input: CreateMeetingInput,
    @Ctx() ctx: AuthorizedContext,
  ): Promise<Meeting> {
    console.log({ input });
    const meeting = this.meetingRepo.create({ ...input });
    const user = await this.userRepo.findOne(ctx.user.id);

    if (!user) {
      throw Error("Blalba");
    }
    meeting.user = Promise.resolve(user);

    await this.meetingRepo.save(meeting);
    return meeting;
  }
}

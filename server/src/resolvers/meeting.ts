import { Meeting } from "../entity/Meeting";
import { Field, InputType, Resolver, Query, Arg, Mutation, Authorized } from "type-graphql";
import { getRepository } from "typeorm";

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
  ) {
    // pass
  }

  @Query(() => [Meeting])
  meetings(): Promise<Meeting[]> {
    return this.meetingRepo.find();
  }

  @Authorized()
  @Mutation(() => Meeting)
  async createMeeting(@Arg("input") meeting: CreateMeetingInput): Promise<Meeting> {
    console.log({ meeting });
    const arrangement = this.meetingRepo.create(meeting);
    await this.meetingRepo.save(arrangement);
    return arrangement;
  }
}

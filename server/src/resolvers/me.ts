import { AuthorizedContext } from "koa";
import { Ctx, Resolver, Authorized, Query, FieldResolver, Root } from "type-graphql";

import { getKey } from "../keys";
import { User } from "../entity/User";
import { getRepository } from "typeorm";

@Resolver(() => User)
export class MeResolver {
  constructor(
    // constructor injection of a service
    private readonly userRepo = getRepository(User),
  ) {
    // pass
  }

  @Authorized()
  @Query(() => User)
  async me(@Ctx() ctx: AuthorizedContext): Promise<User> {
    const user = await this.userRepo.findOne({
      id: ctx.user.id,
    });

    return user;
  }

  @FieldResolver(() => Boolean)
  async keyIsAvailable(@Root() user: User): Promise<boolean> {
    return !!(await getKey(user.id));
  }
}

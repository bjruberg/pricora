import { AuthorizedContext } from "koa";
import { Ctx, Resolver, Arg, Mutation, Authorized } from "type-graphql";

import { changePassword } from "./../rest/user";
import { User } from "../entity/User";

@Resolver(() => User)
export class UserResolver {
  @Authorized()
  @Mutation(() => Boolean)
  async changePassword(
    @Arg("currentPassword") currentPassword: string,
    @Arg("newPassword") newPassword: string,
    @Ctx() ctx: AuthorizedContext,
  ): Promise<boolean> {
    const passwordChanged = await changePassword(ctx, currentPassword, newPassword);
    return passwordChanged;
  }
}

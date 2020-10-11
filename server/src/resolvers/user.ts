import { AuthorizedContext } from "koa";
import { Ctx, Resolver, Arg, Mutation, Authorized, Query } from "type-graphql";

import { changePassword } from "./../rest/user";
import { User } from "../entity/User";
import { getRepository, IsNull, Not } from "typeorm";

@Resolver(() => User)
export class UserResolver {
  constructor(
    // constructor injection of a service
    private readonly userRepo = getRepository(User),
  ) {
    // pass
  }

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

  @Authorized("ADMIN")
  @Mutation(() => Boolean)
  async deleteUser(@Arg("userId") userId: string): Promise<boolean> {
    return !!(await this.userRepo
      .createQueryBuilder()
      .where("id = :id", { id: userId, primaryAdmin: false })
      .softDelete()
      .execute());
  }

  @Authorized("ADMIN")
  @Mutation(() => Boolean)
  async restoreUser(@Arg("userId") userId: string): Promise<boolean> {
    return !!(await this.userRepo
      .createQueryBuilder()
      .where("id = :id", { id: userId })
      .restore()
      .execute());
  }

  @Authorized("ADMIN")
  @Mutation(() => Boolean)
  async toggleUserAdmin(@Arg("userId") userId: string, @Arg("on") on: boolean): Promise<boolean> {
    const user = await this.userRepo.findOne({ id: userId });
    user.isAdmin = on;
    await this.userRepo.save(user);
    return true;
  }

  @Authorized("ADMIN")
  @Query(() => [User])
  users(@Arg("deleted") deleted: boolean): Promise<User[]> {
    return this.userRepo.find({
      where: { primaryAdmin: false, deletedAt: deleted ? Not(IsNull()) : IsNull() },
      withDeleted: deleted,
    });
  }
}

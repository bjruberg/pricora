import { AuthorizedContext, Context, Next } from "koa";
import jwt from "jsonwebtoken";
import { User } from "./entity/User";
import { saveKey } from "./keys";
import { SharedUser } from "../../shared/user";

export const getUser = (ctx: AuthorizedContext): void => {
  ctx.status = 200;
  ctx.body = ctx.user;
};

export const logoutUser = async (ctx: AuthorizedContext, next: Next): Promise<void> => {
  saveKey(ctx.user.id, null);
  ctx.cookies.set("Authorization", "");
  ctx.status = 200;
  await next();
};

export const provideAuthorizationInContext = async (ctx: Context, next: Next): Promise<void> => {
  const { configuration } = ctx;
  const token = ctx.cookies.get("Authorization");
  ctx.user = null;
  if (token) {
    try {
      const decodedUser = jwt.verify(token, configuration.jwtSecretKey) as SharedUser;
      ctx.user = decodedUser;
    } catch (err) {
      // pass
    }
  }
  await next();
};

export const restrictedForUsers = async (ctx: Context, next: Next): Promise<void> => {
  if (!ctx.user || !ctx.user.id) {
    ctx.throw(401);
  }

  await next();
};

export const restrictedForAdmins = async (ctx: Context, next: Next): Promise<void> => {
  if (!ctx.user || !ctx.user.id) {
    ctx.throw(401);
  }

  const user = await ctx.db.manager.findOne(User, { id: ctx.user.id });
  if (!user || !user.isAdmin || user.deletedAt) {
    ctx.throw(401);
  }

  await next();
};

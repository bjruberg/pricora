import { AuthorizedContext, Context, Next } from "koa";
import { includes, pick } from "lodash";
import jwt from "jsonwebtoken";
import { AuthChecker } from "type-graphql";
import { User } from "./entity/User";
import { saveKey } from "./keys";
import { SharedUser } from "../../shared/user";
import { MeetingToken } from "./entity/MeetingToken";

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

export const graphqlAuthChecker: AuthChecker<Context, "ATTENDANT" | "ADMIN"> = async (
  { context },
  roles,
): Promise<boolean> => {
  if (!context || !context.user || !context.user.id) {
    if (includes(roles, "ATTENDANT")) {
      const { auth } = context.query;
      const tokenFound = await context.db.manager.findOne(MeetingToken, {
        id: auth,
      });
      if (tokenFound) {
        const timeSinceTokenCreation =
          new Date().valueOf() - new Date(tokenFound.created).valueOf();

        // Check for limited 2h validity of token
        if (timeSinceTokenCreation < 1000 * 60 * 60 * 2) {
          return Promise.resolve(true);
        }

        context.status = 401;
        return Promise.resolve(false);
      }
      context.status = 401;
      return Promise.resolve(false);
    }
    context.status = 401;
    return Promise.resolve(false);
  }

  const user = await context.db.manager.findOne(User, { id: context.user.id });

  if (!user || user.deletedAt) {
    context.status = 401;
    return Promise.resolve(false);
  }

  if (includes(roles, "ADMIN") && !user.isAdmin) {
    context.status = 401;
    return Promise.resolve(false);
  }

  context.user = pick(user, ["id", "email", "firstName", "lastName", "isAdmin"]);
  return Promise.resolve(true);
};

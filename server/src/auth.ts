import { getConnection } from "typeorm";
import { AuthorizedContext, Context, Next } from "koa";
import jwt from "jsonwebtoken";
import { saveKey } from "./keys";
import { SharedUser } from "../../shared/user";
import { User } from "./entity/User";

export const checkUserAuthorization = async (ctx: AuthorizedContext): Promise<void> => {
  ctx.status = 200;
  ctx.body = ctx.user;
  const user = await getConnection().manager.find(User, { id: ctx.user.id });
  if (!user) {
    ctx.throw("user is not existing", 401);
  }
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

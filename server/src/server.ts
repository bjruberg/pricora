import { config } from "node-config-ts";
import { includes, pick } from "lodash";
import Koa, { Context } from "koa";
import koaBody from "koa-body";
import koaCompress from "koa-compress";
import koaError from "koa-better-error-handler";
import Router from "koa-router";
import koaServe from "koa-static-server";
import koaGraphql from "koa-graphql";
import { AuthChecker, buildSchema } from "type-graphql";

import {
  getUser,
  provideAuthorizationInContext,
  logoutUser,
  restrictedForAdmins,
  restrictedForUsers,
} from "./auth";

import { loginUser, registerUser } from "./rest/user";

import { Configuration } from "./entity/Configuration";
import { MeetingResolver } from "./resolvers/meeting";
import { UserResolver } from "./resolvers/user";
import { User } from "./entity/User";
import { getConnection } from "./db";

const customAuthChecker: AuthChecker<Context> = async ({ context }, roles): Promise<boolean> => {
  if (!context || !context.user || !context.user.id) {
    context.throw("Not logged in", 401);
    return Promise.resolve(false);
  }

  const user = await context.db.manager.findOne(User, { id: context.user.id });

  if (!user || user.deletedAt) {
    context.throw("User does not exist", 401);
    return Promise.resolve(false);
  }

  if (includes(roles, "ADMIN") && !user.isAdmin) {
    context.throw("Not an admin", 401);
    return Promise.resolve(false);
  }

  context.user = pick(user, ["id", "email", "firstName", "lastName", "isAdmin"]);
  return Promise.resolve(true);
};

export const startServer = async (configuration: Configuration): Promise<void> => {
  const app = new Koa();
  console.log({ NODE_ENV: process.env.NODE_ENV });
  // no types availabe
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  app.context.onerror = koaError();
  app.context.api = true;

  // brotli is too slow for here
  app.use(koaCompress({ br: false }));

  // Provide repeatedly used functionality in ctx
  app.use(async (ctx: Context, next) => {
    ctx.db = await getConnection();
    ctx.configuration = configuration;
    await next();
  });

  app.use(provideAuthorizationInContext);

  const router = new Router<any, Koa.Context>();

  router.get("/api/getUser", restrictedForUsers, getUser);
  router.post("/api/login", koaBody(), loginUser);
  router.post("/api/logout", restrictedForUsers, logoutUser);
  router.post("/api/register", restrictedForAdmins, koaBody(), registerUser);

  const schema = await buildSchema({
    authChecker: customAuthChecker,
    resolvers: [MeetingResolver, UserResolver],
    emitSchemaFile: {
      path: __dirname + "/../../shared/schema.gql",
      commentDescriptions: true,
      sortedSchema: false, // by default the printed schema is sorted alphabetically
    },
  });

  router.all(
    "/graphql",
    koaGraphql({
      schema,
      graphiql: true,
    }),
  );

  app.use((ctx, next) => {
    return next().catch((err): void => {
      ctx.status = err?.status || 500;
      ctx.body = { error: err?.message };
      console.error(err);
    });
  });

  app.use(router.routes());
  app.use(router.allowedMethods());

  app.use(
    koaServe({
      maxage: 60000,
      rootPath: "/i18n",
      rootDir: `${__dirname}/../../client/src/i18n`,
    }),
  );

  app.use(
    koaServe({
      rootDir: `${__dirname}/../../client/dist`,
      notFoundFile: `index.html`,
    }),
  );

  app.listen(config.server.port);
  console.log("Server is listening on port 3000");
};

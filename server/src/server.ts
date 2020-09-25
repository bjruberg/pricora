import { config } from "node-config-ts";
import Koa, { Context } from "koa";
import koaBody from "koa-body";
import koaCompress from "koa-compress";
import koaError from "koa-better-error-handler";
import Router from "koa-router";
import koaServe from "koa-static-server";
import koaGraphql from "koa-graphql";
import { AuthChecker, buildSchema } from "type-graphql";

import { Connection } from "typeorm";

import {
  getUser,
  provideAuthorizationInContext,
  loginUser,
  logoutUser,
  registerUser,
  restrictedForUsers,
} from "./user";
import { getConnection } from "./db";
import { Configuration } from "entity/Configuration";
import { SharedUser } from "../../shared/user";
import { MeetingResolver } from "./resolvers/meeting";

declare module "koa" {
  interface Context {
    configuration: Configuration;
    db: Connection;
    user?: SharedUser | null;
  }

  interface AuthorizedContext extends Koa.ParameterizedContext {
    configuration: Configuration;
    db: Connection;
    user: SharedUser;
  }
}

const customAuthChecker: AuthChecker<Context> = ({ context }) => {
  return !!context.user && !!context.user.id;
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
  router.post("/api/register", restrictedForUsers, koaBody(), registerUser);

  const schema = await buildSchema({
    authChecker: customAuthChecker,
    resolvers: [MeetingResolver],
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
      // console.error(err);
    });
  });

  app.use(router.routes());
  app.use(router.allowedMethods());

  // Serve files required for client
  app.use(
    koaServe({
      rootDir: `${__dirname}/../../client/dist`,
      notFoundFile: `index.html`,
    }),
  );

  app.listen(config.server.port);
  console.log("Server is listening on port 3000");
};

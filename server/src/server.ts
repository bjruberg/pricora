import { config } from "node-config-ts";

import fs from "fs";
import http2 from "http2";

import Koa, { Context } from "koa";
import koaBody from "koa-body";
import koaCompress from "koa-compress";
import koaError from "koa-better-error-handler";
import Router from "koa-router";
import koaServe from "koa-static-server";
import koaGraphql from "koa-graphql";
import { buildSchema } from "type-graphql";

import {
  getUser,
  graphqlAuthChecker,
  provideAuthorizationInContext,
  logoutUser,
  restrictedForAdmins,
  restrictedForUsers,
} from "./auth";

import { loginUser, registerUser } from "./rest/user";

import { Configuration } from "./entity/Configuration";
import { MeetingResolver } from "./resolvers/meeting";
import { UserResolver } from "./resolvers/user";
import { getConnection } from "./db";
import { exportMeeting } from "./rest/export";

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
  router.get("/api/exportMeeting", restrictedForUsers, exportMeeting);

  const schema = await buildSchema({
    authChecker: graphqlAuthChecker,
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
      last: false,
      maxage: 1000 * 60 * 60 * 24 * 10,
      rootDir: `${__dirname}/../../client/dist`,
    }),
  );

  app.use(
    koaServe({
      maxage: 0, // no cache for index.html
      rootDir: `${__dirname}/../../client/dist`,
      notFoundFile: `index.html`,
    }),
  );

  console.log(`Server is listening on port ${config.server.port}`);

  //http.createServer(app.callback()).listen(config.server.port);
  http2
    .createSecureServer(
      {
        key: fs.readFileSync(config.server.pathToKeyFile),
        cert: fs.readFileSync(config.server.pathToCertFile),
      },
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      app.callback(),
    )
    .listen(config.server.port + 1);
};

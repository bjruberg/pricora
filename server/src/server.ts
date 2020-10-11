import { config } from "node-config-ts";

import fs from "fs";
import http from "http";
import https from "https";
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

const isProduction = process.env.NODE_ENV === "production";

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
    ctx.db = getConnection();
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
      graphiql: !isProduction,
    }),
  );

  app.use((ctx, next) => {
    return next().catch((err): void => {
      ctx.status = err?.status || 500;
      ctx.body = { error: err?.message };
      if (ctx.status !== 401) {
        console.error(err);
      }
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
      maxage: 0, // no cache for html
      rootDir: `${__dirname}/../../client/dist`,
      notFoundFile: `nocache.html`,
    }),
  );

  let server: http.Server | https.Server | http2.Http2Server;

  if (config.server.https && config.server.http2) {
    // path for directly exposed application
    server = http2.createSecureServer(
      {
        key: fs.readFileSync(config.server.pathToKeyFile),
        cert: fs.readFileSync(config.server.pathToCertFile),
      },
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      app.callback(),
    );

    /* 
      Workaround bug in koa-body caused by http2 usage:
      https://github.com/nodejs/node/issues/31309
      https://github.com/dlau/koa-body/issues/154
    */
    server.setTimeout(5000);
  } else if (config.server.http2) {
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    server = http2.createServer(app.callback());
    server.setTimeout(5000);
  } else if (config.server.https) {
    server = https.createServer(
      {
        key: fs.readFileSync(config.server.pathToKeyFile),
        cert: fs.readFileSync(config.server.pathToCertFile),
      },
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      app.callback(),
    );
  } else {
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    server = http.createServer(app.callback());
  }

  server.listen(config.server.port, config.server.bind);

  console.log(
    `Server is listening on port ${config.server.https ? "https" : "http"}://${config.server.bind
    }:${config.server.port}`,
  );
};

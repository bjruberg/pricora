import Koa, { Context } from "koa";
import koaBody from "koa-body";
import koaCompress from "koa-compress";
import Router from "koa-router";
import koaServe from "koa-static-server";

import { Connection } from "typeorm";

import { getUser, isLoggedIn, loginUser, registerUser } from "./auth";
import { getConnection } from "./db";
import { Configuration } from "entity/Configuration";

declare module "koa" {
  interface Context {
    configuration: Configuration;
    db: Connection;
    user: Record<string, any> | null;
  }
}

export const startServer = (configuration: Configuration): void => {
  const app = new Koa();

  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  app.use(koaCompress());

  // Provide repeatedly used functionality in ctx
  app.use(async (ctx: Context, next) => {
    ctx.db = await getConnection();
    ctx.configuration = configuration;
    await next();
  });

  const router = new Router<any, Koa.Context>();

  router.get("/api/getUser", isLoggedIn, getUser);
  router.post("/api/login", koaBody(), loginUser);
  router.post("/api/register", isLoggedIn, koaBody(), registerUser);

  app.use((ctx, next) => {
    return next().catch((err): void => {
      ctx.status = err?.status || 500;
      ctx.body = err?.message;
      console.error(err);
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

  app.listen(3000);
  console.log("Server is listening on port 3000");
};

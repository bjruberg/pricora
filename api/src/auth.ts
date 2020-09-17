import { compare, hash } from "bcryptjs";
import { Context, Next } from "koa";
import { includes } from "lodash";
import jwt from "jsonwebtoken";
import { User } from "./entity/User";

import {
  CustomContext,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
} from "./api";

export const getUser = (ctx: Context): void => {
  ctx.status = 200;
  ctx.body = ctx.user;
};

export const registerUser = async (ctx: CustomContext<RegisterResponse>): Promise<void> => {
  const { password, email } = <RegisterRequest>ctx.request.body;

  if (!email || email.length < 3) {
    ctx.status = 400;
    ctx.body = {
      msg: "Please enter a username with min. 3 chars",
    };
    return;
  }

  if (!password || password.length < 6) {
    ctx.status = 400;
    ctx.body = {
      msg: "Please enter a password with min. 6 chars",
    };
    return;
  }

  const { configuration, db } = ctx;
  const userRepository = db.getRepository(User);
  const existingUser = await userRepository.findOne({ email });

  if (existingUser) {
    ctx.status = 409;
    ctx.body = {
      msg: "This username is already in use!",
    };
    return;
  }

  const hashedPw = await hash(password, configuration.passwordSalt);

  const newUser = new User();
  newUser.email = email;
  newUser.password = hashedPw;

  await userRepository.save(newUser);
};

export const loginUser = async (ctx: CustomContext<LoginResponse>): Promise<void> => {
  const { password, email } = <LoginRequest>ctx.request.body;
  const { configuration, db } = ctx;
  const userRepository = db.getRepository(User);
  const requestedUser = await userRepository.findOne({ email });

  if (!requestedUser) {
    ctx.status = 409;
    ctx.body = {
      msg: "Username or password is incorrect!",
    };
    return;
  }

  const matches = await compare(password, requestedUser.password);

  if (!matches) {
    ctx.status = 409;
    ctx.body = {
      msg: "Username or password is incorrect!",
    };
    return;
  }

  ctx.status = 200;

  const token = jwt.sign(
    {
      email: requestedUser.email,
    },
    configuration.jwtSecretKey,
    {
      expiresIn: "7d",
    },
  );

  ctx.cookies.set("Authorization", token, {
    domain: includes(ctx.host, "localhost") ? "" : ctx.host,
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};

export const isLoggedIn = async (ctx: Context, next: Next): Promise<void> => {
  const { configuration } = ctx;
  const token = ctx.cookies.get("Authorization");
  ctx.user = null;
  if (token) {
    try {
      const decoded = jwt.verify(token, configuration.jwtSecretKey) as Record<string, any>;
      ctx.user = decoded;
      await next();
    } catch (err) {
      ctx.throw(401);
    }
  } else {
    ctx.throw(401);
  }
};

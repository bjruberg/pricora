import crypto from "crypto";
import { compare, hash, genSalt } from "bcryptjs";
import { Context, Next } from "koa";
import { includes, pick } from "lodash";
import jwt from "jsonwebtoken";
import { promisify } from "util";
import { User } from "./entity/User";
import { SharedUser } from "../../shared/user";
import { CustomContext, LoginResponse, RegisterResponse } from "../../shared/api";

const pbkdf2Async = promisify(crypto.pbkdf2);
const randomBytes = promisify(crypto.randomBytes);

const bufferToHex = (buffer: Buffer) => buffer.toString("hex");

export const getUser = (ctx: Context): void => {
  ctx.status = 200;
  ctx.body = ctx.user;
};

export const createUser = async (password: string, passwordSalt: string): Promise<User> => {
  /*
   * Generate a password encrypted key that is used later to encrypt all relevant data
   */

  const [
    generatedUserEncryptionKey,
    generatedUserSalt,
    hashedPw,
    initializationVector,
  ] = await Promise.all([
    randomBytes(32).then(bufferToHex),
    genSalt(15),
    hash(password, passwordSalt),
    randomBytes(8).then(bufferToHex),
  ]);

  const derivedKey = await pbkdf2Async(
    password,
    generatedUserSalt,
    100000,
    64,
    "sha512",
  ).then((b) => b.slice(32, 64));

  const cipher = crypto.createCipheriv("aes-256-cbc", derivedKey, initializationVector);
  const encryptedUserEncryptionKey = cipher.update(generatedUserEncryptionKey, "utf8", "base64");

  const newUser = new User();
  newUser.encryptedDecriptionKey = [initializationVector, ":", encryptedUserEncryptionKey].join();
  newUser.encryptionSalt = generatedUserSalt;
  newUser.password = hashedPw;

  return newUser;
};

export const registerUser = async (ctx: CustomContext<RegisterResponse>): Promise<void> => {
  const { firstName, lastName, password, email } = ctx.request.body;

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
    ctx.throw("This username is already in use!", 409);
  }

  const newUser = await createUser(password, configuration.passwordSalt);

  newUser.email = email;
  newUser.firstName = firstName;
  newUser.lastName = lastName;

  await userRepository.save(newUser);
};

export const loginUser = async (ctx: CustomContext<LoginResponse>): Promise<void> => {
  const { password, email } = ctx.request.body;
  const { configuration, db } = ctx;
  const userRepository = db.getRepository(User);
  const requestedUser = await userRepository.findOne({ email });

  if (!requestedUser) {
    ctx.status = 409;
    ctx.body = {
      msg: "Please enter a password with min. 6 chars",
    };
    return;
  }

  const matches = await compare(password, requestedUser.password);

  if (!matches) {
    ctx.status = 409;
    ctx.body = {
      msg: "Please enter a password with min. 6 chars",
    };
    return;
  }

  ctx.status = 200;

  const token = jwt.sign(
    pick(requestedUser, ["email", "firstName", "id", "isAdmin", "lastName"]),
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

export const logoutUser = async (ctx: Context, next: Next): Promise<void> => {
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

import { compare, hash, genSalt } from "bcryptjs";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { includes, pick } from "lodash";
import { promisify } from "util";
import { saveKey } from "../keys";
import { User } from "../entity/User";
import {
  encryptDataUsingKey,
  decryptDataUsingKey,
  generateInitialSecret,
} from "../utils/encryption";
import { CustomContext, LoginResponse, RegisterResponse } from "../../../shared/api";

const pbkdf2Async = promisify(crypto.pbkdf2);

export const createUser = async (password: string, passwordSalt: string): Promise<User> => {
  /* Generate a key pair. Public key will be used for encryption, private key will be saved in the database in encrypted form. */
  // const { publicKey: encryptionKey, privateKey: decryptionKey } = await generateKeyPair(4096);

  const [generatedUserSalt, hashedPw] = await Promise.all([
    genSalt(15),
    hash(password, passwordSalt),
  ]);

  const { generatedSecret, generatedInitializationVector } = await generateInitialSecret();

  const keyDerivedFromPassword = await pbkdf2Async(
    password,
    generatedUserSalt,
    100000,
    64,
    "sha512",
  ).then((b) => b.slice(32, 64));

  const encryptedSecret = encryptDataUsingKey(
    keyDerivedFromPassword,
    generatedInitializationVector,
    generatedSecret,
  );

  const newUser = new User();
  newUser.encryptedSecretWithIV = [generatedInitializationVector, ":", encryptedSecret].join("");
  newUser.passwordDeviationSalt = generatedUserSalt;
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
  ctx.status = 200;
  ctx.body = {
    msg: "Ok",
  };
};

export const loginUser = async (ctx: CustomContext<LoginResponse>): Promise<void> => {
  const { password, email } = ctx.request.body;
  const { configuration, db } = ctx;
  const userRepository = db.getRepository(User);
  const requestedUser = await userRepository.findOne({ email });

  if (!requestedUser) {
    ctx.status = 409;
    ctx.body = {
      msg: "User or password is incorrect",
    };
    return;
  }

  const matches = await compare(password, requestedUser.password);

  if (!matches) {
    ctx.status = 409;
    ctx.body = {
      msg: "User or password is incorrect",
    };
    return;
  }

  try {
    const keyDerivedFromPassword = await pbkdf2Async(
      password,
      requestedUser.passwordDeviationSalt,
      100000,
      64,
      "sha512",
    ).then((b) => b.slice(32, 64));

    const [iv, encryptendSecret] = requestedUser.encryptedSecretWithIV.split(":");

    // Setup AES description using the passwordDerivedKey
    const decryptedUserSecret = decryptDataUsingKey(keyDerivedFromPassword, iv, encryptendSecret);

    saveKey(requestedUser.id, decryptedUserSecret);
  } catch (e) {
    // pass
    ctx.status = 417;
    ctx.body = {
      msg: "Encryption setup failed",
    };
    console.error(e);
    return;
  }

  const token = jwt.sign(
    pick(requestedUser, ["email", "firstName", "id", "isAdmin", "lastName"]),
    configuration.jwtSecretKey,
    {
      expiresIn: "7d",
    },
  );

  ctx.status = 200;

  ctx.cookies.set("Authorization", token, {
    domain: includes(ctx.host, "localhost") ? "" : ctx.host,
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};

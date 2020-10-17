import { AuthorizedContext, Next } from "koa";
import { compare, hash, genSalt } from "bcryptjs";
import jwt from "jsonwebtoken";
import { includes, pick } from "lodash";
import { getRepository } from "typeorm";
import { saveKey } from "../keys";
import { User } from "../entity/User";
import {
  encryptDataUsingKey,
  decryptDataUsingKey,
  deriveAESKeyFromPassword,
  generateInitialSecret,
  generateIV,
} from "../utils/encryption";
import { CustomContext, LoginResponse, RegisterResponse } from "../../../shared/api";

export const changePassword = async (
  ctx: AuthorizedContext,
  oldPassword: string,
  newPassword: string,
): Promise<boolean> => {
  if (newPassword.length < 8) {
    ctx.throw("New password needs to be at least 8 characters long", 406);
  }

  const userRepository = getRepository(User);
  const requestedUser = await userRepository.findOne({ id: ctx.user.id });

  if (!requestedUser) {
    ctx.throw("User is not known", 401);
  }

  const matches = await compare(oldPassword, requestedUser.password);

  if (!matches) {
    ctx.throw("The entered password is not the current one", 406);
  }

  // Prepare to reencrypt the personal private key
  const keyDerivedFromOldPassword = await deriveAESKeyFromPassword(
    oldPassword,
    requestedUser.passwordDeviationSalt,
  );

  const [oldIV, encryptedSecret] = requestedUser.encryptedSecretWithIV.split(":");

  const decryptedSecret = decryptDataUsingKey(keyDerivedFromOldPassword, oldIV, encryptedSecret);

  const newIV = await generateIV();

  const keyDerivedFromNewPassword = await deriveAESKeyFromPassword(
    newPassword,
    requestedUser.passwordDeviationSalt,
  );

  const newEncryptedSecret = encryptDataUsingKey(keyDerivedFromNewPassword, newIV, decryptedSecret);
  const newPasswordHash = await hash(newPassword, requestedUser.passwordDeviationSalt);

  requestedUser.encryptedSecretWithIV = [newIV, ":", newEncryptedSecret].join("");
  requestedUser.password = newPasswordHash;
  requestedUser.requirePasswordChange = false;

  return userRepository.save(requestedUser).then(() => {
    return true;
  });
};

export const createUser = async (password: string, passwordSalt: string): Promise<User> => {
  const [generatedUserSalt, hashedPw] = await Promise.all([
    genSalt(15),
    hash(password, passwordSalt),
  ]);

  const { generatedSecret, generatedInitializationVector } = await generateInitialSecret();

  const keyDerivedFromPassword = await deriveAESKeyFromPassword(password, generatedUserSalt);

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

export const registerUser = async (
  ctx: CustomContext<RegisterResponse>,
  next: Next,
): Promise<void> => {
  const { firstName, lastName, password, email, isAdmin } = ctx.request.body;

  if (!email || email.length < 3) {
    ctx.status = 400;
    ctx.body = {
      msg: "Please enter a username with min. 3 chars",
    };
    await next();
    return;
  }

  if (!password || password.length < 8) {
    ctx.status = 400;
    ctx.body = {
      msg: "Please enter a password having min. 8 chars",
    };
    await next();
    return;
  }

  const { configuration, db } = ctx;
  const userRepository = (await db).getRepository(User);
  const existingUser = await userRepository.findOne({ email });

  if (existingUser) {
    ctx.throw("This username is already in use!", 409);
  }

  const newUser = await createUser(password, configuration.passwordSalt);

  newUser.email = email;
  newUser.firstName = firstName;
  newUser.lastName = lastName;
  newUser.isAdmin = isAdmin;

  await userRepository.save(newUser);
  ctx.status = 200;
  ctx.body = {
    msg: "Ok",
  };
  await next();
};

export const loginUser = async (ctx: CustomContext<LoginResponse>, next: Next): Promise<any> => {
  const { password, email } = ctx.request.body;
  const { configuration, db } = ctx;
  const userRepository = (await db).getRepository(User);
  const requestedUser = await userRepository.findOne({ email });

  if (!requestedUser) {
    ctx.status = 409;
    ctx.body = {
      msg: "User or password is incorrect",
    };
    await next();
    return;
  }

  const matches = await compare(password, requestedUser.password);

  if (!matches) {
    ctx.status = 409;
    ctx.body = {
      msg: "User or password is incorrect",
    };
    await next();
    return;
  }

  try {
    const keyDerivedFromPassword = await deriveAESKeyFromPassword(
      password,
      requestedUser.passwordDeviationSalt,
    );

    const [iv, encryptedSecret] = requestedUser.encryptedSecretWithIV.split(":");

    // Setup AES description using the passwordDerivedKey
    const decryptedUserSecret = decryptDataUsingKey(keyDerivedFromPassword, iv, encryptedSecret);

    saveKey(requestedUser.id, decryptedUserSecret);
  } catch (e) {
    // pass
    ctx.status = 417;
    ctx.body = {
      msg: "Encryption setup failed",
    };
    console.error(e);
    await next();
    return;
  }

  const token = jwt.sign(
    pick(requestedUser, [
      "email",
      "firstName",
      "id",
      "isAdmin",
      "lastName",
      "requirePasswordChange",
    ]),
    configuration.jwtSecretKey,
    {
      expiresIn: "7d",
    },
  );

  ctx.status = 200;

  ctx.cookies.set("Authorization", token, {
    domain: includes(ctx.host, "localhost") ? "" : ctx.host,
    overwrite: true,
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  requestedUser.lastLogin = new Date();
  void userRepository.save(requestedUser);

  await next();
};

export const logoutUser = async (ctx: AuthorizedContext, next: Next): Promise<void> => {
  ctx.cookies.set("Authorization", "removed", {
    expires: new Date(1),
    maxAge: 1,
    overwrite: true,
    sameSite: "strict",
  });
  ctx.status = 200;
  await next();
};

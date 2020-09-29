import crypto, { KeyObject } from "crypto";
import { config } from "node-config-ts";
import { promisify } from "util";

const randomBytes = promisify(crypto.randomBytes);
const generateKeyPairAsync = promisify(crypto.generateKeyPair);
const pbkdf2Async = promisify(crypto.pbkdf2);

const bufferToHex = (buffer: Buffer) => buffer.toString("hex");

export const deriveAESKeyFromPassword = (password: string, salt: string): Promise<Buffer> => {
  return pbkdf2Async(password, salt, 100000, 64, "sha512").then((b) => b.slice(32, 64));
};

export const generateIV = async (): Promise<string> => {
  return randomBytes(8).then(bufferToHex);
};

export const generateSecret = (): Promise<Buffer> => randomBytes(32);

export const generateInitialSecret = async (): Promise<{
  generatedSecret: string;
  generatedInitializationVector: string;
}> => {
  const [generatedSecret, generatedInitializationVector] = await Promise.all([
    randomBytes(16).then(bufferToHex),
    randomBytes(8).then(bufferToHex),
  ]);

  return {
    generatedSecret,
    generatedInitializationVector,
  };
};

export const decryptDataUsingKey = (
  key: string | Buffer,
  initializationVector: string,
  encryptedData: string,
): string => {
  const hashedKey = crypto.createHash("sha256").update(key).digest();
  const decipher = crypto.createDecipheriv(
    config.encryption.cipher,
    hashedKey,
    initializationVector,
  );
  const decrypted = decipher.update(encryptedData, "base64", "utf8") + decipher.final("utf8");
  return decrypted;
};

export const encryptDataUsingKey = (
  key: string | Buffer,
  initializationVector: string,
  data: string,
): string => {
  const hashedKey = crypto.createHash("sha256").update(key).digest();
  const cipher = crypto.createCipheriv(config.encryption.cipher, hashedKey, initializationVector);

  const encrypted = cipher.update(data, "utf8", "base64") + cipher.final("base64");

  return encrypted;
};

export const generateKeyPair = async (
  modulusLength: number,
): Promise<{
  publicKey: KeyObject;
  privateKey: KeyObject;
}> => {
  return await generateKeyPairAsync("rsa", {
    modulusLength,
  });
};

export const exportKey = (key: KeyObject): string => {
  return Buffer.from(
    key.export({ type: key.type === "public" ? "spki" : "pkcs8", format: "pem" }),
  ).toString("utf-8");
};

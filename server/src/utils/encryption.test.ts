import {
  decryptDataUsingKey,
  generateInitialSecret,
  encryptDataUsingKey,
  generateKeyPair,
  generateIV,
  generateSecret,
} from "./encryption";
import { privateDecrypt, publicEncrypt } from "crypto";

const runEncryptionWithSelfGeneratedKeys = async (dataToEncrypt) => {
  const { generatedSecret, generatedInitializationVector } = await generateInitialSecret();

  return {
    generatedSecret,
    generatedInitializationVector,
    encrypted: encryptDataUsingKey(generatedSecret, generatedInitializationVector, dataToEncrypt),
  };
};

test("Encryption and decryption is possible and correct using the keys we generate", async () => {
  const dataToEncrypt = "encrypt this";
  const encryptionPromise = runEncryptionWithSelfGeneratedKeys(dataToEncrypt);
  void expect(encryptionPromise).resolves.toBeTruthy();
  const { generatedSecret, generatedInitializationVector, encrypted } = await encryptionPromise;

  return expect(
    decryptDataUsingKey(generatedSecret, generatedInitializationVector, encrypted),
  ).toEqual(dataToEncrypt);
});

test("Asymmetrically encrypts a secret which encrypts private key and vice versa", async () => {
  const { privateKey, publicKey } = await generateKeyPair(4096);
  const { privateKey: privateKeyToEncrypt } = await generateKeyPair(4096);
  const generatedSecret = await generateSecret();
  const iv = await generateIV();

  const encryptedSecret = publicEncrypt({ key: publicKey }, generatedSecret);

  expect(encryptedSecret).toBeTruthy();

  const encryptedPrivateKey = encryptDataUsingKey(generatedSecret, iv, privateKeyToEncrypt);

  const restoredPrivateKey = decryptDataUsingKey(generatedSecret, iv, encryptedPrivateKey);
  expect(restoredPrivateKey).toEqual(privateKeyToEncrypt);

  const decryptedSecret = privateDecrypt({ key: privateKey }, encryptedSecret);

  expect(decryptedSecret).toEqual(generatedSecret);
}, 200000);

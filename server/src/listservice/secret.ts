import { EntityManager } from "typeorm";
import { User } from "../entity/User";
import { Secret } from "../entity_meeting/Secret";
import { encryptDataUsingKey, generateIV } from "../utils/encryption";

export const createSecret = async (
  user: User,
  userSecret: string,
  exportedDecryptionKey: string,
  manager: EntityManager,
): Promise<Secret> => {
  const generatedIV = await generateIV();

  const newSecret = manager.create(Secret);
  newSecret.encryptionIV = generatedIV;
  newSecret.encryptedDecriptionKey = encryptDataUsingKey(
    userSecret,
    generatedIV,
    exportedDecryptionKey,
  );
  newSecret.user_id = user.id;
  newSecret.user_email = user.email;

  return manager.save(newSecret);
};

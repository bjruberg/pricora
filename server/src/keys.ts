/* In-memory or redis store of decrypted by-user encryption keys */
import { config } from "node-config-ts";
import { createClient } from "redis";
import { promisify } from "util";

const keysByUser: Record<string, string> = {};
const redisClient = createClient({
  host: config.redis.host,
  port: config.redis.port,
  retry_strategy: () => {
    return undefined;
  },
});
redisClient.on("error", () => {
  console.log("No redis server found");
});
// eslint-disable-next-line @typescript-eslint/unbound-method
const getAsync = promisify(redisClient.get).bind(redisClient);

export const saveKey = (id: string, key: string): void => {
  if (redisClient.connected) {
    redisClient.set(id, key);
  } else {
    keysByUser[id] = key;
  }
};

export const getKey = async (id: string): Promise<string | null> => {
  if (redisClient.connected) {
    return getAsync(id);
  } else {
    return Promise.resolve(keysByUser[id]);
  }
};

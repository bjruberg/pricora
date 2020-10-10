/* In-memory or redis store of decrypted by-user encryption keys */
import { config } from "node-config-ts";
import { createClient, RedisClient } from "redis";
import { promisify } from "util";

const keysByUser: Record<string, string | null> = {};
let redisClient: RedisClient;
let getAsync: (arg1: string) => Promise<string>;
let setAsync: (arg1: string, arg2: string) => Promise<unknown>;

if (process.env.NODE_ENV === "development") {
  redisClient = createClient({
    disable_resubscribing: true,
    enable_offline_queue: false,

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
  getAsync = promisify(redisClient.get).bind(redisClient);
  // eslint-disable-next-line @typescript-eslint/unbound-method
  setAsync = promisify(redisClient.set).bind(redisClient);
}

export const saveKey = (id: string, key: string | null): void => {
  if (redisClient?.connected) {
    void setAsync(id, key || "");
  } else {
    keysByUser[id] = key;
  }
};

export const getKey = async (id: string): Promise<string | null> => {
  if (redisClient?.connected) {
    return getAsync(id);
  } else {
    return Promise.resolve(keysByUser[id]);
  }
};

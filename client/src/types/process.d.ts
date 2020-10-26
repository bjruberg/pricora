import { Config } from "node-config-ts";

type Frontend = Config["frontend"];

declare global {
  namespace NodeJS {
    type ProcessEnv = Frontend;
  }
}

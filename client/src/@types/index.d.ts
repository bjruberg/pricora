import { Config } from "node-config-ts";

declare module "*.svg" {
  const src: string;
  export default src;
}
type Frontend = Config["frontend"];

declare global {
  namespace NodeJS {
    type ProcessEnv = Frontend;
  }
}

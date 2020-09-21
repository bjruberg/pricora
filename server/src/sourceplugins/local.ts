import { config } from "node-config-ts";
import { promises } from "fs";

import { ISourcePlugin } from "../datasource/dataplugin";

class LocalPlugin implements ISourcePlugin {
  constructor() {
    // pass
  }
  getMeetingList(): Promise<string[]> {
    return promises.readdir(config.source.plugin);
  }
}

export default LocalPlugin;

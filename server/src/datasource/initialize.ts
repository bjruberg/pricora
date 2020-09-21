import { config } from "node-config-ts";
import LocalPlugin from "../sourceplugins/local";
import { SourcePlugin } from "./dataplugin";

const plugins = {
  local: LocalPlugin,
};

export const init = async () => {
  const SelectedPlugin = <SourcePlugin>plugins[config.source.plugin];
  const p = new SelectedPlugin();
  const files = await p.getMeetingList();
};

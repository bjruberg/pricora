import { Connection } from "typeorm";
import { config } from "node-config-ts";
import FolderPlugin from "../sourceplugins/folder";

export interface ISourcePlugin {
  getMeetingFileList(): Promise<string[]>;
  createConnections(uuids: string[]): void;

  addMeeting(uuid: string): Promise<Connection>;
  deleteMeeting(uuid: string): Promise<void>;
}

export interface SourcePlugin {
  // eslint-disable-next-line prettier/prettier
  new(): ISourcePlugin;
}

const plugins = {
  folder: FolderPlugin,
};

const SelectedPlugin = <SourcePlugin>plugins[config.source.plugin];
export const sourcePlugin = new SelectedPlugin();

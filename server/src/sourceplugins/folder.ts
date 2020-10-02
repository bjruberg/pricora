import { config } from "node-config-ts";
import { promises } from "fs";
import { map, has, omit } from "lodash";
import { Connection, ConnectionOptions, createConnection } from "typeorm";

import { ISourcePlugin } from "../listservice/plugin";

const dbFileFolder = config.plugins.folder.path;

const createConnectionOptions = (uuid: string): ConnectionOptions => ({
  database: `${dbFileFolder}/${uuid}.sqlite`,
  name: uuid,
  type: "sqlite",
  entities: [__dirname + "/../entity_meeting/{*.ts,*.js}"],
  synchronize: true,
});

class FolderPlugin implements ISourcePlugin {
  connections: Record<string, Promise<Connection>>;
  constructor() {
    this.connections = {};
  }

  createConnections(uuids: string[]): Promise<Connection>[] {
    return map(uuids, (uuid) => {
      this.connections[uuid] = createConnection(createConnectionOptions(uuid));
      return this.connections[uuid];
    });
  }

  createConnection(uuid: string): Promise<Connection> {
    this.connections[uuid] = createConnection(createConnectionOptions(uuid));
    return this.connections[uuid];
  }

  getConnection(uuid: string): Promise<Connection> | undefined {
    return this.connections[uuid];
  }

  getMeetingFileList(): Promise<string[]> {
    return promises.readdir(config.plugins.folder.path);
  }

  addMeeting(uuid: string): Promise<Connection> {
    const newConnection = createConnection(createConnectionOptions(uuid));
    this.connections[uuid] = newConnection;
    return newConnection;
  }

  async deleteMeeting(uuid: string): Promise<void> {
    if (has(this.connections, uuid)) {
      const connection = await this.connections[uuid];
      await connection.close();
    }
    this.connections = omit(this.connections, uuid);
    return promises.unlink(`${dbFileFolder}/${uuid}.sqlite`);
  }

  updated(): Promise<void> {
    return Promise.resolve();
  }
}

export default FolderPlugin;

import { config } from "node-config-ts";
import { promises } from "fs";
import { forEach, has, omit } from "lodash";
import { Connection, createConnection } from "typeorm";

import { ISourcePlugin } from "../listservice/plugin";

const dbFileFolder = config.plugins.folder.path;

class FolderPlugin implements ISourcePlugin {
  connections: Record<string, Promise<Connection>>;
  constructor() {
    this.connections = {};
  }

  createConnections(uuids: string[]): void {
    forEach(uuids, (uuid) => {
      this.connections[uuid] = createConnection({
        database: `${dbFileFolder}/${uuid}.sqlite`,
        name: uuid,
        type: "sqlite",
        entities: [__dirname + "/../entity_meeting/{*.ts,*.js}"],
        synchronize: true,
      });
    });
  }

  getConnection(uuid: string): Promise<Connection> | undefined {
    return this.connections[uuid];
  }

  getMeetingFileList(): Promise<string[]> {
    return promises.readdir(config.plugins.folder.path);
  }

  addMeeting(uuid: string): Promise<Connection> {
    const newConnection = createConnection({
      database: `${dbFileFolder}/${uuid}.sqlite`,
      name: uuid,
      type: "sqlite",
      entities: [__dirname + "/../entity_meeting/*.ts"],
      synchronize: true,
    });
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

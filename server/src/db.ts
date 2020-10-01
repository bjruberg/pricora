import { config } from "node-config-ts";
import { Connection, createConnection } from "typeorm";
let connection: Connection;

export const getConnection = async (): Promise<Connection> => {
  if (connection) {
    return connection;
  }
  connection = await createConnection({
    type: "sqlite",
    database: config.database.path,
    entities: [__dirname + "/entity/{*.ts,*.js}"],
    logging: false,
    migrationsTableName: "migrations",
    synchronize: true,
  });
  return connection;
};

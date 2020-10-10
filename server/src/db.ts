import { config } from "node-config-ts";
import { Connection, createConnection } from "typeorm";
let connection: Promise<Connection>;

export const getConnection = (): Promise<Connection> => {
  if (typeof connection !== "undefined") {
    return connection;
  }
  connection = createConnection({
    type: "sqlite",
    database: config.database.path,
    entities: [__dirname + "/entity/{*.ts,*.js}"],
    logging: false,
    migrationsTableName: "migrations",
    synchronize: true,
  });

  return connection;
};

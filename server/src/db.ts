import fs from "fs";
import { config } from "node-config-ts";
import { Connection, createConnection } from "typeorm";
let connection: Promise<Connection>;

export const getConnection = (): Promise<Connection> => {
  if (typeof connection !== "undefined") {
    return connection;
  }

  const isDbExisting = fs.existsSync(config.database.path);

  connection = createConnection({
    type: "sqlite",
    database: config.database.path,
    entities: [__dirname + "/entity/{*.ts,*.js}"],
    logging: false,
    migrations: [__dirname + "/migration/*.ts"],
    migrationsTableName: "migrations",
    synchronize: !isDbExisting || process.env.NODE_ENV !== "production",
  });

  return connection.then((c) => {
    return c.runMigrations().then(() => c);
  });
};

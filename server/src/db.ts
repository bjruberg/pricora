import { Connection, createConnection } from "typeorm";
let connection: Connection;

export const getConnection = async (): Promise<Connection> => {
  if (connection) {
    return connection;
  }
  connection = await createConnection();
  return connection;
};

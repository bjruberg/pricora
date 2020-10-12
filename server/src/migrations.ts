import { createConnection } from "typeorm";
import { dbConfig } from "./db";

void (async () => {
  const connection = await createConnection({
    ...dbConfig,
    type: "sqlite",
    logging: true,
    migrationsRun: true,
    synchronize: true,
  });

  await connection.close();
})();

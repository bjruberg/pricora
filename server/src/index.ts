import "reflect-metadata";
import * as bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import { getConnection } from "./db";
import { startServer } from "./server";
import { init } from "./datasource/initialize";

import { Configuration } from "./entity/Configuration";

const initializeApp = async (): Promise<void> => {
  const connection = await getConnection();

  const configRepository = connection.getRepository(Configuration);
  let configuration = await configRepository.findOne(1);

  if (!configuration) {
    configuration = new Configuration();
  }

  configuration.jwtSecretKey = configuration.jwtSecretKey || uuidv4();
  configuration.passwordSalt = configuration.passwordSalt || bcrypt.genSaltSync(10);
  void startServer(configuration);
  void configRepository.save(configuration);
  void init();
};

void initializeApp();

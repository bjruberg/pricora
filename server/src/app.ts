import "reflect-metadata";
import * as bcrypt from "bcryptjs";
import { config } from "node-config-ts";
import { v4 as uuidv4 } from "uuid";
import { getConnection } from "./db";
import { startServer } from "./server";
import { createUser } from "./rest/user";
import removeOldTokens from "./jobs/removeOldTokens";
import { init } from "./listservice/initialize";

import { Configuration } from "./entity/Configuration";
import { User } from "./entity/User";

const initializeApp = async (): Promise<void> => {
  const connection = await getConnection();

  const configRepository = connection.getRepository(Configuration);
  let configuration = await configRepository.findOne(1);

  if (!configuration) {
    configuration = new Configuration();
  }

  configuration.jwtSecretKey = configuration.jwtSecretKey || uuidv4();
  configuration.passwordSalt = configuration.passwordSalt || bcrypt.genSaltSync(10);

  const adminUser = await connection.manager.findOne(User, { isAdmin: true });
  if (!adminUser) {
    const createdUser = await createUser(config.initialAdminPassword, configuration.passwordSalt);
    createdUser.email = config.adminEmail;
    createdUser.firstName = "Admin";
    createdUser.isAdmin = true;
    createdUser.requirePasswordChange = true;
    void connection.manager.save(createdUser);
  }

  void startServer(configuration);
  void configRepository.save(configuration);
  void init();
  removeOldTokens();
  setInterval(removeOldTokens, 1000 * 60 * 2);
};

void initializeApp();

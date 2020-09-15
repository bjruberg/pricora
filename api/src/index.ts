import "reflect-metadata";
import { createConnection } from "typeorm";
import { User } from "./entity/User";

const c = createConnection();

c.then(async (connection) => {
  console.log("Loading users from the database...");
  const users = await connection.manager.find(User);
  console.log(users[0]);
  console.log("Loaded users: ", users);

  console.log("Here you can setup and run express/koa/any other framework.");
}).catch((error) => console.log(error));

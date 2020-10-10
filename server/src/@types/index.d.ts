import { Connection } from "typeorm";
import { Configuration } from "../entity/Configuration";
import { SharedUser } from "../../../shared/user";

declare module "koa" {
  interface Context {
    configuration: Configuration;
    db: Promise<Connection>;
    user?: SharedUser | null;
  }

  interface AuthorizedContext extends ParameterizedContext {
    configuration: Configuration;
    db: Promise<Connection>;
    user: SharedUser;
  }
}

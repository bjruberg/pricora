import { createContext } from "preact";
import { SharedUser } from "../../../shared/user";

export const UserContext = createContext<SharedUser | undefined>(undefined);

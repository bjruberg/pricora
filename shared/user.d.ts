import { User } from "../server/src/entity/User"
export type SharedUser = Partial<Pick<User, "email" | "firstName" | "isAdmin" | "lastName">>
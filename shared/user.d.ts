import { User } from "../server/src/entity/User"
export type SharedUser = Pick<User, "email" | "firstName" | "id" | "isAdmin" | "lastName" | "requirePasswordChange">
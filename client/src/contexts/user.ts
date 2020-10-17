import { createContext } from "preact";
import { SharedUser } from "../../../shared/user";

export const UserContext = createContext<{
  isLoading: boolean;
  refetchUser: () => Promise<unknown>;
  remove: () => Promise<unknown>;
  user: SharedUser | undefined;
}>({
  isLoading: false,
  refetchUser: () => Promise.resolve(),
  remove: () => Promise.resolve(),
  user: undefined,
});

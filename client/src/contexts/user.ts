import { createContext } from "preact";
import { SharedUser } from "../../../shared/user";

export const UserContext = createContext<{
  isLoading: boolean;
  refetchUser: () => Promise<unknown>;
  user: SharedUser | undefined;
}>({
  isLoading: false,
  refetchUser: () => Promise.resolve(),
  user: undefined,
});

import { FunctionalComponent, h } from "preact";
import { useContext } from "preact/hooks";

import LoginPage from "../pages/login";
import { UserContext } from "../contexts/user";

interface PrivateRouteProps {
  Component: FunctionalComponent<any>;
}

const PrivateRoute: FunctionalComponent<PrivateRouteProps> = ({ Component, ...props }) => {
  const { user, isLoading } = useContext(UserContext);

  return isLoading ? null : user ? <Component {...props} /> : <LoginPage />;
};

export default PrivateRoute;

import { FunctionalComponent, h } from "preact";
import { useContext } from "preact/hooks";
import AsyncRoute from "preact-async-route";

import LoginPage from "../pages/login";
import { UserContext } from "../contexts/user";

interface PrivateRouteProps {
  Component?: FunctionalComponent<any>;
  getComponent?: (
    this: AsyncRoute,
    url: string,
    callback: (component: any) => void,
    props: any,
  ) => Promise<any> | void;
  path: string;
}

const PrivateRoute: FunctionalComponent<PrivateRouteProps> = ({ Component, ...props }) => {
  const { user, isLoading } = useContext(UserContext);

  return isLoading ? null : user ? <AsyncRoute component={Component} {...props} /> : <LoginPage />;
};

export default PrivateRoute;

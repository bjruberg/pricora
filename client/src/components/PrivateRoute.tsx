import { FunctionalComponent, h } from "preact";

import PageContainer from "./PageContainer";
import { UserContext } from "../contexts/user";

interface PrivateRouteProps {
  Component: FunctionalComponent<any>;
}

const PrivateRoute: FunctionalComponent<PrivateRouteProps> = ({ Component, ...props }) => {
  return (
    <UserContext.Consumer>
      {(user) =>
        user?.isAdmin ? <Component {...props} /> : <PageContainer>Please login</PageContainer>
      }
    </UserContext.Consumer>
  );
};

export default PrivateRoute;

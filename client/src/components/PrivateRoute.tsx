import { FunctionalComponent, h } from "preact";

import PageContainer from "./PageContainer";
import { UserContext } from "../contexts/user";

const PrivateRoute: FunctionalComponent = ({ children }) => {
  return (
    <UserContext.Consumer>
      {(user) => (user?.isAdmin ? children : <PageContainer>Please login</PageContainer>)}
    </UserContext.Consumer>
  );
};

export default PrivateRoute;

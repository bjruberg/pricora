import { FunctionalComponent, h } from "preact";
import { useContext, useEffect } from "preact/hooks";
import { TranslateContext } from "@denysvuika/preact-translate";
import { route } from "preact-router";

import PageContainer from "./PageContainer";
import { UserContext } from "../contexts/user";
import { routes } from "../routes";

interface PrivateRouteProps {
  Component: FunctionalComponent<any>;
}

const PrivateRoute: FunctionalComponent<PrivateRouteProps> = ({ Component, ...props }) => {
  const user = useContext(UserContext);
  const { t } = useContext(TranslateContext);
  useEffect(() => {
    if (!user) {
      route(routes.login);
    }
  }, [user]);
  return user?.isAdmin ? (
    <Component {...props} />
  ) : (
    <PageContainer>{t("pleaseLogIn")}</PageContainer>
  );
};

export default PrivateRoute;

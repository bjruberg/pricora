import { FunctionalComponent, h } from "preact";
import { useContext } from "preact/hooks";
import { TranslateContext } from "@denysvuika/preact-translate";

import PageContainer from "./PageContainer";
import { UserContext } from "../contexts/user";
import { ErrorMessage } from "../ui/message";

interface AdminRouteProps {
  Component: FunctionalComponent<any>;
}

const AdminRoute: FunctionalComponent<AdminRouteProps> = ({ Component, ...props }) => {
  const { user, isLoading } = useContext(UserContext);
  const { t } = useContext(TranslateContext);

  return isLoading ? null : user && user.isAdmin ? (
    <Component {...props} />
  ) : (
    <PageContainer>
      <ErrorMessage>{t("general.adminRightRequired")}</ErrorMessage>
    </PageContainer>
  );
};

export default AdminRoute;

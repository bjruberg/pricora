import { FunctionalComponent, h } from "preact";
import { useContext } from "preact/hooks";
import AsyncRoute from "preact-async-route";
import { TranslateContext } from "@denysvuika/preact-translate";

import PageContainer from "./PageContainer";
import { UserContext } from "../contexts/user";
import { ErrorMessage } from "../ui/message";

interface AdminRouteProps {
  getComponent: (
    this: AsyncRoute,
    url: string,
    callback: (component: any) => void,
    props: any,
  ) => Promise<any> | void;
  path: string;
}

const AdminRoute: FunctionalComponent<AdminRouteProps> = ({ getComponent, ...props }) => {
  const { user, isLoading } = useContext(UserContext);
  const { t } = useContext(TranslateContext);

  return isLoading ? null : user && user.isAdmin ? (
    <AsyncRoute {...props} getComponent={getComponent} />
  ) : (
    <PageContainer {...props}>
      <ErrorMessage>{t("general.adminRightRequired")}</ErrorMessage>
    </PageContainer>
  );
};

export default AdminRoute;

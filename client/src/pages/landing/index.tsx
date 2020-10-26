import { Fragment, FunctionalComponent, h } from "preact";
import { useContext } from "preact/hooks";
import { Link } from "preact-router/match";
import { TranslateContext } from "@denysvuika/preact-translate";
import PageContainer from "../../components/PageContainer";
import Breadcrumbs from "../../components/Breadcrumbs";
import { routes } from "../../routes";

import welcomePage from "../../../../config/welcome.html";
import customWelcomePage from "../../../../config/custom_welcome.html";

const LandingPage: FunctionalComponent = () => {
  const { t } = useContext(TranslateContext);
  return (
    <Fragment>
      <Breadcrumbs>
        <Link aria-current="page" href={routes.welcome}>
          {t("navigation.welcome")}
        </Link>
      </Breadcrumbs>
      <PageContainer>
        {customWelcomePage ? <div dangerouslySetInnerHTML={{ __html: customWelcomePage }} /> : null}
        <div dangerouslySetInnerHTML={{ __html: welcomePage }} />
      </PageContainer>
    </Fragment>
  );
};

export default LandingPage;

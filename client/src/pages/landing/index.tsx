import { FunctionalComponent, h } from "preact";
import PageContainer from "../../components/PageContainer";
import { pageGreeting, pageTitle } from "../../constants";

const LandingPage: FunctionalComponent = () => {
  return (
    <PageContainer>
      <h1 className="mb-6">{pageTitle}</h1>
      <span>{pageGreeting}</span>
    </PageContainer>
  );
};

export default LandingPage;

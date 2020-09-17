import { FunctionalComponent, h } from "preact";

const PageContainer: FunctionalComponent = ({ children }) => {
  return <div className="px-6 py-4">{children}</div>;
};

export default PageContainer;

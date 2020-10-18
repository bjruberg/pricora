import { FunctionalComponent, h } from "preact";
import { useContext } from "preact/hooks";
import { Link } from "preact-router/match";
import { TranslateContext } from "@denysvuika/preact-translate";
import { routes } from "../routes";

import "./Breadcrumbs.css";

export const Breadcrumbs: FunctionalComponent = ({ children }) => {
  const { t } = useContext(TranslateContext);
  return (
    <nav
      aria-label="Breadcrumb"
      class="breadcrumbs width-full bg-blue-600 px-5 py-1 text-white text-xs"
    >
      <Link href={routes.meetinglist}>{t("navigation.meetinglist")}</Link>
      {children}
    </nav>
  );
};

export default Breadcrumbs;

import { TranslateContext } from "@denysvuika/preact-translate";
import { FunctionalComponent, h } from "preact";
import { useContext } from "preact/hooks";

const Topline: FunctionalComponent = () => {
  const { t } = useContext(TranslateContext);
  return (
    <div class="bg-gray-800 p-1 px-2 text-white text-xs">
      <strong>Pricora</strong> - {t("navigation.banner")}.
    </div>
  );
};

export default Topline;

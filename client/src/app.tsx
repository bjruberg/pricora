import { h, render } from "preact";
import "preact/devtools";
import { get } from "lodash";
import { TranslateProvider } from "@denysvuika/preact-translate";

import AppRoot from "./root";

const savedLanuage = localStorage.getItem("language") || process.env.language;

const App = () => {
  return (
    <TranslateProvider
      fallbackLang={process.env.language}
      lang={savedLanuage}
      root={`${get(process.env, "hostname", "")}/i18n`}
    >
      <AppRoot />
    </TranslateProvider>
  );
};

render(<App />, document.body);

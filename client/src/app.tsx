import { h, render } from "preact";
import "preact/devtools";
import { TranslateProvider } from "@denysvuika/preact-translate";

import { hostname, language } from "./constants";
import AppRoot from "./root";

const savedLanuage = localStorage.getItem("language") || language;

const App = () => {
  return (
    <TranslateProvider fallbackLang={language} lang={savedLanuage} root={`${hostname}/i18n`}>
      <AppRoot />
    </TranslateProvider>
  );
};

render(<App />, document.body);

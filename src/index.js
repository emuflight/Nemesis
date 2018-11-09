import React from "react";
import ReactDOM from "react-dom";
import { App } from "./App";
import registerServiceWorker from "./utilities/registerServiceWorker";
import "../node_modules/react-grid-layout/css/styles.css";
import "../node_modules/react-resizable/css/styles.css";
import { IntlProvider, addLocaleData } from "react-intl";

import localeData from "react-intl/locale-data";

import messages_cn from "./translations/cn.json";
import messages_cz from "./translations/cz.json";
import messages_de from "./translations/de.json";
import messages_en from "./translations/en.json";
import messages_es from "./translations/es.json";
import messages_fr from "./translations/fr.json";
import messages_it from "./translations/it.json";
import messages_pl from "./translations/pl.json";
import messages_ru from "./translations/ru.json";
import messages_sr from "./translations/sr.json";

addLocaleData(localeData);

const messages = {
  cn: messages_cn,
  cz: messages_cz,
  en: messages_en,
  de: messages_de,
  es: messages_es,
  fr: messages_fr,
  it: messages_it,
  pl: messages_pl,
  ru: messages_ru,
  sr: messages_sr
};
const language = navigator.language.split(/[-_]/)[0]; // language without region code

const activeMessages = messages[language] || messages.en;
const activeLocale   = messages[language] ? language : "en";
ReactDOM.render(
  <IntlProvider
    locale={activeLocale}
    defaultLocale="en"
    messages={activeMessages}
  >
    <App
      style={{ flex: "1", display: "flex", positon: "relative", width: "100%" }}
    />
  </IntlProvider>,
  document.getElementById("root")
);
registerServiceWorker();

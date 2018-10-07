import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import registerServiceWorker from "./utilities/registerServiceWorker";
import "../node_modules/react-grid-layout/css/styles.css";
import "../node_modules/react-resizable/css/styles.css";
import { IntlProvider, addLocaleData } from "react-intl";
import locale_en from "react-intl/locale-data/en";
import locale_de from "react-intl/locale-data/de";
import locale_es from "react-intl/locale-data/es";
import locale_fr from "react-intl/locale-data/fr";
import locale_it from "react-intl/locale-data/it";
import locale_ru from "react-intl/locale-data/ru";

import messages_en from "./translations/en.json";
import messages_de from "./translations/de.json";
import messages_es from "./translations/es.json";
import messages_fr from "./translations/fr.json";
import messages_it from "./translations/it.json";
import messages_ru from "./translations/ru.json";

const messages = {
  en: messages_en,
  de: messages_de,
  es: messages_es,
  fr: messages_fr,
  it: messages_it,
  ru: messages_ru
};
addLocaleData([
  ...locale_en,
  ...locale_de,
  ...locale_es,
  ...locale_fr,
  ...locale_it,
  ...locale_ru
]);
const language = navigator.language.split(/[-_]/)[0]; // language without region code

ReactDOM.render(
  <IntlProvider
    locale={language}
    defaultLocale="en"
    messages={messages[language] || messages.en}
  >
    <App
      style={{ flex: "1", display: "flex", positon: "relative", width: "100%" }}
    />
  </IntlProvider>,
  document.getElementById("root")
);
registerServiceWorker();

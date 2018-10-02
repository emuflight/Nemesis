import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import registerServiceWorker from "./utilities/registerServiceWorker";
import "../node_modules/react-grid-layout/css/styles.css";
import "../node_modules/react-resizable/css/styles.css";
import { IntlProvider, addLocaleData } from "react-intl";
import locale_en from 'react-intl/locale-data/en';
import locale_de from 'react-intl/locale-data/de';

import messages_de from "./translations/de.json";
import messages_en from "./translations/en.json";

const messages = {
    'de': messages_de,
    'en': messages_en
};
const language = navigator.language.split(/[-_]/)[0];  // language without region code

ReactDOM.render(
  <IntlProvider locale={navigator.language} defaultLocale="en" messages={messages[language]}>
    <App
      style={{ flex: "1", display: "flex", positon: "relative", width: "100%" }}
    />
  </IntlProvider>,
  document.getElementById("root")

);
registerServiceWorker();
addLocaleData([...locale_en, ...locale_de]);


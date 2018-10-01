import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import registerServiceWorker from "./utilities/registerServiceWorker";
import "../node_modules/react-grid-layout/css/styles.css";
import "../node_modules/react-resizable/css/styles.css";

ReactDOM.render(
  <App
    style={{ flex: "1", display: "flex", positon: "relative", width: "100%" }}
  />,
  document.getElementById("root")
);
registerServiceWorker();

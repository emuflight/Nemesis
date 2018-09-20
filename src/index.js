import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import registerServiceWorker from "./utilities/registerServiceWorker";

ReactDOM.render(
  <App
    style={{ flex: "1", display: "flex", positon: "relative", width: "100%" }}
  />,
  document.getElementById("root")
);
registerServiceWorker();

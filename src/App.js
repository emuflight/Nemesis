import React, { Component } from "react";
import theme from "material-ui/styles/baseThemes/lightBaseTheme";
import MuiThemeProvider from "material-ui/styles/MuiThemeProvider";
import getMuiTheme from "material-ui/styles/getMuiTheme";

import Connected from "./Views/Connected";
import Disconnected from "./Views/Disconnected";
import FCConnector from "./utilities/FCConnector";
import fcConfig from "./test/test_config.json";
import uiConfig from "./test/ui_config.json";
const electron = window.require("electron"); // little trick to import electron in react
const ipcRenderer = electron.ipcRenderer;

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      updateReady: false,
      deviceInfo: {},
      connected: false
    };
    ipcRenderer.on("updateReady", (event, text) => {
      this.setState({ updateReady: true });
    });
    FCConnector.startDetect(deviceInfo => {
      this.setState({
        deviceInfo: deviceInfo,
        connected: deviceInfo.connected
      });
    });
  }

  componentDidMount() {
    FCConnector.tryGetConfig().then(connectedDevice => {
      console.log(connectedDevice);
      this.setState({
        id: connectedDevice.comName,
        deviceInfo: connectedDevice,
        // currentConfig: fcConfig,
        currentConfig: connectedDevice.config,
        connected: true
      });
    });
  }

  render() {
    if (this.state.connected) {
      return (
        <MuiThemeProvider muiTheme={getMuiTheme(theme)}>
          <Connected
            connectinId={this.state.id}
            uiConfig={uiConfig}
            fcConfig={this.state.currentConfig}
          />
        </MuiThemeProvider>
      );
    } else {
      return (
        <MuiThemeProvider muiTheme={getMuiTheme(theme)}>
          <Disconnected message={this.uiMessage} />
        </MuiThemeProvider>
      );
    }
  }
}

export default App;

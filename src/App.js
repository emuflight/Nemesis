import React, { Component } from "react";
import theme from "material-ui/styles/baseThemes/lightBaseTheme";
import MuiThemeProvider from "material-ui/styles/MuiThemeProvider";
import getMuiTheme from "material-ui/styles/getMuiTheme";

import Connected from "./Views/Connected";
import Disconnected from "./Views/Disconnected";
import DfuView from "./Views/DfuView";
import FCConnector from "./utilities/FCConnector";
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
    FCConnector.startDetect(device => {
      if (device.connected) {
        this.getFcConfig();
      } else {
        this.setState(device);
      }
    });

    this.uiConfig = uiConfig;
    this.baseRoutes = this.uiConfig.routes;
  }
  setupRoutes(config) {
    this.uiConfig.routes = this.baseRoutes.map(route => {
      return {
        key: route,
        title: route,

        items: Object.keys(config)
          .filter(key => {
            return this.uiConfig.groups[route].indexOf(key) !== -1;
          })
          .map(k => {
            let itemObj = Object.assign(
              {
                id: k,
                element: this.uiConfig.elements[k]
              },
              config[k]
            );
            if (itemObj.element) {
              itemObj.step = itemObj.element.step || itemObj.step;
              itemObj.values = itemObj.element.values || itemObj.values;
              itemObj.axis = itemObj.element.axis;
            } else if (itemObj.values) {
              itemObj.values = itemObj.values.map(item => {
                return {
                  value: item,
                  label: item
                };
              });
            }
            return itemObj;
          })
      };
    });
  }

  goToDFU = () => {
    FCConnector.goToDFU();
  };

  getFcConfig = () => {
    FCConnector.tryGetConfig().then(connectedDevice => {
      if (connectedDevice.dfu) {
        this.setState({
          dfu: connectedDevice.dfu,
          deviceInfo: connectedDevice
        });
      } else {
        connectedDevice.config && this.setupRoutes(connectedDevice.config);
        this.setState({
          id: connectedDevice.comName,
          deviceInfo: connectedDevice,
          // currentConfig: fcConfig,
          currentConfig: connectedDevice.config,
          connected: true
        });
      }
    });
  };

  componentDidMount() {
    this.getFcConfig();
  }

  render() {
    if (this.state.dfu) {
      return (
        <MuiThemeProvider muiTheme={getMuiTheme(theme)}>
          <DfuView info={this.state.deviceInfo} />
        </MuiThemeProvider>
      );
    } else if (this.state.connected) {
      return (
        <MuiThemeProvider muiTheme={getMuiTheme(theme)}>
          <Connected
            goToDFU={this.goToDFU}
            connectinId={this.state.id}
            uiConfig={this.uiConfig}
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

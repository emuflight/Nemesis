import React, { Component } from "react";
import theme from "material-ui/styles/baseThemes/darkBaseTheme";
import MuiThemeProvider from "material-ui/styles/MuiThemeProvider";
import getMuiTheme from "material-ui/styles/getMuiTheme";

import Connected from "./Views/Connected";
import Disconnected from "./Views/Disconnected";
import ImufView from "./Views/ImufView";
import DfuView from "./Views/DfuView";
import FCConnector from "./utilities/FCConnector";

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      deviceInfo: {},
      connected: false
    };

    FCConnector.startDetect(device => {
      if (device.connected) {
        this.getFcConfig();
      } else if (!device.progress) {
        this.setState({
          imuf: false,
          connected: false,
          dfu: false,
          deviceInfo: undefined
        });
      }
    });
  }

  goToDFU = () => {
    FCConnector.goToDFU();
  };

  goToImuf = () => {
    this.setState({ imuf: true });
  };

  getFcConfig = () => {
    this.setState({ connecting: true });
    return FCConnector.tryGetConfig()
      .then(connectedDevice => {
        this.setState({
          connecting: false,
          dfu: connectedDevice.dfu,
          id: connectedDevice.comName,
          deviceInfo: connectedDevice,
          currentConfig: connectedDevice.config,
          connected: true
        });
        return connectedDevice.config;
      })
      .catch(device => {
        this.setState({
          connecting: false,
          deviceInfo: device,
          incompatible: true
        });
      });
  };

  componentDidMount() {
    this.getFcConfig();
  }

  render() {
    if (this.state.imuf) {
      return (
        <MuiThemeProvider muiTheme={getMuiTheme(theme)}>
          <ImufView />
        </MuiThemeProvider>
      );
    } else if (this.state.dfu) {
      return (
        <MuiThemeProvider muiTheme={getMuiTheme(theme)}>
          <DfuView />
        </MuiThemeProvider>
      );
    } else if (this.state.connected) {
      return (
        <MuiThemeProvider muiTheme={getMuiTheme(theme)}>
          <Connected
            goToDFU={this.goToDFU}
            goToImuf={this.goToImuf}
            connectinId={this.state.id}
            fcConfig={this.state.currentConfig}
          />
        </MuiThemeProvider>
      );
    } else {
      return (
        <MuiThemeProvider muiTheme={getMuiTheme(theme)}>
          <Disconnected
            connecting={this.state.connecting}
            device={this.state.deviceInfo}
          />
        </MuiThemeProvider>
      );
    }
  }
}

export default App;

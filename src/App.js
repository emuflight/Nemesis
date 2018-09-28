import React, { Component } from "react";
import Connected from "./Views/Connected";
import Disconnected from "./Views/Disconnected";
import ImufView from "./Views/ImufView";
import DfuView from "./Views/DfuView";
import FCConnector from "./utilities/FCConnector";
import theme from "./Themes/Dark";
import { MuiThemeProvider } from "@material-ui/core/styles";

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
        let stateObj = {
          imuf: false,
          connected: false,
          dfu: false,
          deviceInfo: undefined
        };
        this.setState(stateObj);
      } else {
        this.setState({
          connecting: false,
          connected: false
        })
      }
    });
  }

  goToImuf = () => {
    this.setState({ imuf: true });
  };

  getFcConfig = () => {
    this.setState({ connecting: true });
    return FCConnector.tryGetConfig()
      .then(device => {
        this.setState({
          connecting: false,
          dfu: device.dfu,
          id: device.comName,
          deviceInfo: device,
          currentConfig: device.config,
          connecting: false,
          connected: !device.incompatible,
          incompatible: device.incompatible
        });
        FCConnector.currentTarget = "";
        return device.config;
      })
      .catch(() => this.setState({ 
        connecting: false,
        connected: false
      }));
  };

  componentDidMount() {
    if (!this.state.connecting) {
      this.getFcConfig();
    }
  }

  render() {
    if (this.state.imuf) {
      return (
        <MuiThemeProvider theme={theme}>
          <ImufView goBack={() => this.setState({ imuf: false })} />
        </MuiThemeProvider>
      );
    } else if (this.state.dfu) {
      return (
        <MuiThemeProvider theme={theme}>
          <DfuView target={FCConnector.currentTarget} />
        </MuiThemeProvider>
      );
    } else if (this.state.connected) {
      return (
        <MuiThemeProvider theme={theme}>
          <Connected
            goToImuf={this.goToImuf}
            connectinId={this.state.id}
            device={this.state.deviceInfo}
            fcConfig={this.state.currentConfig}
          />
        </MuiThemeProvider>
      );
    } else {
      return (
        <MuiThemeProvider theme={theme}>
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

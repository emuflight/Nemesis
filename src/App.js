import React, { Component } from "react";
import Connected from "./Views/Connected";
import Disconnected from "./Views/Disconnected";
import ImufView from "./Views/ImufView/ImufView";
import DfuView from "./Views/DfuView/DfuView";
import FCConnector from "./utilities/FCConnector";
import themes from "./Themes/Dark";
import { MuiThemeProvider } from "@material-ui/core/styles";

export const FCConfigContext = React.createContext({});

export class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      deviceInfo: {},
      connected: false,
      theme: themes.dark
    };
  }

  detectFc = device => {
    if (device.progress || device.telemetry) {
      return;
    }
    if (device.connected) {
      this.getFcConfig();
    } else if (!this.state.rebooting) {
      this.setState({
        connecting: false,
        imuf: false,
        connected: false,
        dfu: false,
        deviceInfo: undefined
      });
    }
  };

  componentDidMount() {
    FCConnector.startDetect(device => this.detectFc(device));
    if (!this.state.connecting) {
      this.getFcConfig();
    }
  }

  goToImuf = () => {
    FCConnector.stopTelemetry();
    this.setState({ imuf: true });
  };

  getFcConfig = () => {
    this.setState({ connecting: true, rebooting: false });
    return FCConnector.tryGetConfig()
      .then(device => {
        if (!device.config) {
          this.setState({
            id: device.comName,
            dfu: device.dfu,
            connected: false,
            connecting: false,
            incompatible: device.incompatible,
            deviceInfo: device
          });
        } else {
          let uiTheme =
            themes[device.config.version.target] ||
            themes[device.config.version.fw] ||
            themes.dark;
          this.setState({
            connecting: false,
            dfu: device.dfu,
            id: device.comName,
            deviceInfo: device,
            currentConfig: device.config,
            connected: true,
            theme: uiTheme
          });
          FCConnector.currentTarget = "";
          return device.config;
        }
      })
      .catch(() =>
        this.setState({
          connecting: false,
          connected: false
        })
      );
  };

  handleSave = () => {
    this.setState({ rebooting: this.state.currentConfig.reboot_on_save });
    return FCConnector.saveConfig().then(() => {
      if (!this.state.currentConfig.reboot_on_save) {
        return this.getFcConfig();
      } else {
        return this.state.currentConfig;
      }
    });
  };

  render() {
    if (this.state.imuf) {
      return (
        <MuiThemeProvider theme={themes.dark}>
          <ImufView goBack={() => this.setState({ imuf: false })} />
        </MuiThemeProvider>
      );
    } else if (this.state.dfu) {
      return (
        <MuiThemeProvider theme={themes.dark}>
          <DfuView target={FCConnector.currentTarget} />
        </MuiThemeProvider>
      );
    } else if (this.state.connected) {
      return (
        <MuiThemeProvider theme={this.state.theme}>
          <Connected
            rebooting={this.state.rebooting}
            handleSave={this.handleSave}
            theme={this.state.theme}
            refreshConfig={this.getFcConfig}
            goToImuf={this.goToImuf}
            connectinId={this.state.id}
            device={this.state.deviceInfo}
            fcConfig={this.state.currentConfig}
          />
        </MuiThemeProvider>
      );
    } else {
      return (
        <MuiThemeProvider theme={themes.dark}>
          <Disconnected
            incompatible={this.state.incompatible}
            connecting={this.state.connecting}
            device={this.state.deviceInfo}
          />
        </MuiThemeProvider>
      );
    }
  }
}

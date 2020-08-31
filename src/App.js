import React, { Component } from "react";
import Connected from "./Views/Connected";
import Disconnected from "./Views/Disconnected";
import ImufView from "./Views/ImufView/ImufView";
import DfuView from "./Views/DfuView/DfuView";
import FCConnector from "./utilities/FCConnector";
import themes from "./Themes/Dark";
import { MuiThemeProvider } from "@material-ui/core/styles";
import "./App.css";

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
    this.setState({ connecting: true });
    return FCConnector.tryGetConfig()
      .then(device => {
        if (!device.config) {
          this.setState({
            appVersion: FCConnector.appVersion,
            id: device.comName,
            dfu: device.dfu,
            connected: false,
            connecting: false,
            incompatible: device.incompatible,
            deviceInfo: device,
            rebooting: false
          });
        } else {
          let uiTheme =
            //TODO: Find out if these other themes are needed
            //themes[device.config.version.target] ||
            //themes[device.config.version.fw] ||
            //themes.dark;

            themes.EmuFlight;
          this.setState({
            appVersion: FCConnector.appVersion,
            connecting: false,
            dfu: device.dfu,
            id: device.comName,
            deviceInfo: device,
            currentConfig: device.config,
            connected: true,
            theme: uiTheme,
            rebooting: false
          });
          FCConnector.currentTarget = "";
          return device.config;
        }
      })
      .catch(() =>
        this.setState({
          appVersion: FCConnector.appVersion,
          connecting: false,
          connected: false,
          rebooting: false
        })
      );
  };

  handleSave = () => {
    this.setState({ rebooting: this.state.currentConfig.reboot_on_save });
    return FCConnector.saveConfig().then(() => {
      if (!this.state.currentConfig.reboot_on_save) {
        return this.getFcConfig().then(() => {
          FCConnector.startTelemetry();
        });
      } else {
        setTimeout(() => {
          FCConnector.startTelemetry();
        }, 7000);
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
      if (this.state.currentConfig) {
        return (
          <MuiThemeProvider theme={themes.dark}>
            <DfuView 
              version={this.state.currentConfig.version} 
              goBack={() => this.setState({ dfu: false })} 
            />
          </MuiThemeProvider>
        );
      } else {
        return (
          <MuiThemeProvider theme={themes.dark}>
            <DfuView />
          </MuiThemeProvider>
        );
      }
    } else if (this.state.connected) {
      return (
        <MuiThemeProvider theme={this.state.theme}>
          <Connected
            appVersion={this.state.appVersion}
            rebooting={this.state.rebooting}
            handleSave={this.handleSave}
            theme={this.state.theme}
            goToImuf={this.goToImuf}
            device={this.state.deviceInfo}
            fcConfig={this.state.currentConfig}
          />
        </MuiThemeProvider>
      );
    } else {
      return (
        <MuiThemeProvider theme={themes.dark}>
          <Disconnected
            appVersion={this.state.appVersion}
            incompatible={this.state.incompatible}
            connecting={this.state.connecting}
            device={this.state.deviceInfo}
          />
        </MuiThemeProvider>
      );
    }
  }
}

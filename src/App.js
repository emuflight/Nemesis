import React, { Component } from "react";
import Connected from "./Views/Connected";
import Disconnected from "./Views/Disconnected";
import ImufView from "./Views/ImufView";
import DfuView from "./Views/DfuView";
import FCConnector from "./utilities/FCConnector";
import themes from "./Themes/Dark";
import { MuiThemeProvider } from "@material-ui/core/styles";

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      deviceInfo: {},
      connected: false,
      theme: themes.dark
    };

    FCConnector.startDetect(device => {
      if (device.progress || device.telemetry) {
        return;
      }
      if (device.connected) {
        this.getFcConfig();
      } else if (!this.rebooting) {
        this.setState({
          connecting: false,
          imuf: false,
          connected: false,
          dfu: false,
          deviceInfo: undefined
        });
      }
    });
  }

  goToImuf = () => {
    this.setState({ imuf: true });
  };

  getFcConfig = () => {
    this.rebooting = false;
    this.setState({ connecting: true, rebooting: false });
    return FCConnector.tryGetConfig()
      .then(device => {
        if (!device.config) {
          this.setState({
            id: device.comName,
            dfu: device.dfu,
            connected: false,
            incompatible: true,
            deviceInfo: device
          });
        } else {
          this.setState({
            connecting: false,
            dfu: device.dfu,
            id: device.comName,
            deviceInfo: device,
            currentConfig: device.config,
            connected: !device.incompatible,
            incompatible: device.incompatible,
            theme: device.config
              ? themes[device.config.version.fw]
              : themes.dark
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
    this.rebooting = this.state.currentConfig.reboot_on_save;
    this.setState({ rebooting: this.state.currentConfig.reboot_on_save });
    return FCConnector.saveConfig();
  };

  componentDidMount() {
    if (!this.state.connecting) {
      this.getFcConfig();
    }
  }

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
            connecting={this.state.connecting}
            device={this.state.deviceInfo}
          />
        </MuiThemeProvider>
      );
    }
  }
}

export default App;

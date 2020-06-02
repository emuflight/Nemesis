import React, { Component } from "react";
import Paper from "@material-ui/core/Paper";
import AuxChannelView from "./AuxChannelView/AuxChannelView";
import ConfigListView from "./ConfigListView/ConfigListView";
import FeaturesView from "./FeaturesView/FeaturesView";
import PortsView from "./PortsView/PortsView";
import CliView from "./CliView/CliView";
import FiltersView from "./FiltersView/FiltersView";
import PidsView from "./PidView/PidView";
import RatesView from "./RatesView/RatesView";
import AppBarView from "./AppBarView/AppBarView";
import FCConnector from "../utilities/FCConnector";
import AssistantView from "./Assistants/AssistantView";
//import ProfileView from "./ProfileView/ProfileView";
import BlackboxView from "./BlackboxView/BlackboxView";
import RXView from "./RXView/RXView";
import MotorsView from "./MotorsView/MotorsView";
import OSDView from "./OSDView/OSDView";
import "./Connected.css";
import { FCConfigContext } from "../App";
import PreFlightCheckView from "./PreFlightCheckView/PreFlightCheckView";
import DrawerView from "./DrawerView";

export default class Connected extends Component {
  constructor(props) {
    super(props);
    this.routes = props.fcConfig.routes;
    this.routeFeatures = props.fcConfig.routeFeatures;
    this.state = {
      theme: props.theme,
      isBxF: props.fcConfig.isBxF,
      pid_profile: props.fcConfig.currentPidProfile,
      rate_profile: props.fcConfig.currentRateProfile,
      craftName: props.fcConfig.name,
      isDirty: false,
      drawerOpen: false,
      currentRoute: props.fcConfig.startingRoute
    };
  }

  getRouteFeatures(key) {
    if (this.routeFeatures[key]) {
      return this.props.fcConfig.features.values
        .filter(feat => {
          return this.routeFeatures[key].indexOf(feat.id) > -1;
        })
        .map(feature => {
          if (feature.hasPort) {
            feature.ports = this.props.fcConfig.ports;
          }
          return feature;
        });
    }
  }

  getRouteItems = (fcConfig, sort = false) => {
    let keys = Object.keys(fcConfig);
    if (sort) {
      keys.sort();
    }
    return keys
      .filter(key => {
        if (this.state.filterOn) {
          return (
            fcConfig[key].id &&
            fcConfig[key].id.indexOf(this.state.filterOn) > -1
          );
        }
        if (this.state.currentRoute.key === "ADVANCED") {
          return fcConfig[key].id && !fcConfig[key].route;
        }
        return fcConfig[key].route === this.state.currentRoute.key;
      })
      .map(k => fcConfig[k]);
  };

  handleDrawerToggle = () => {
    if (this.state.drawerOpen) {
      FCConnector.pauseTelemetry();
    } else {
      FCConnector.resumeTelemetry();
    }
    this.setState({ drawerOpen: !this.state.drawerOpen });
  };

  handleSearch = event => {
    this.setState({ filterOn: event.target.value });
  };

  handleSave = () => {
    this.setState({ isDirty: false });
    return this.props.handleSave().then(config => {
      this.setState({ fcConfig: config });
    });
  };

  handleMenuItemClick = key => {
    let newRoute = this.routes.find(route => route.key === key);
    if (this.state.isDirty) {
      // this.handleSave();
      //TODO: save EEPROM
    }
    this.setState({
      filterOn: undefined,
      drawerOpen: false,
      currentRoute: newRoute
    });
  };

  notifyDirty = (isDirty, item, newValue) => {
    if (isDirty) {
      this.setState({ isDirty: isDirty });
    }
  };

  openAssistant(routeName) {
    FCConnector.pauseTelemetry();
    this.setState({ openAssistant: true, assistantType: routeName });
  }
  closeAssistant() {
    this.setState({ openAssistant: false, assistantType: "" });
    FCConnector.resumeTelemetry();
  }
  render() {
    let contents;
    let mergedProfile = this.props.fcConfig;
    switch (this.state.currentRoute.key) {
      case "PFC":
        contents = (
          <PreFlightCheckView
            goToImuf={this.props.goToImuf}
            fcConfig={mergedProfile}
            handleSave={this.handleSave}
            modelUrl={this.state.theme.modelUrl}
            openAssistant={name => this.openAssistant(name)}
          />
        );
        break;
      case "PID": {
        let profile = this.props.fcConfig.currentPidProfile;
        mergedProfile = Object.assign(
          {},
          mergedProfile,
          mergedProfile.pid_profile.values[profile]
        );
        contents = (
          <PidsView
            fcConfig={mergedProfile}
            isBxF={mergedProfile.isBxF}
            handleSave={this.handleSave}
            changeProfile={newProfile => {
              this.notifyDirty(
                true,
                mergedProfile.currentPidProfile,
                newProfile
              );
              FCConnector.changeProfile("pid", newProfile).then(() => {
                this.props.fcConfig.currentPidProfile = newProfile;
                this.forceUpdate();
              });
            }}
            notifyDirty={(isDirty, item, newValue) =>
              this.notifyDirty(isDirty, item, newValue)
            }
            id="pid_profile"
            active={profile}
            profileList={mergedProfile.pidProfileList}
            items={this.getRouteItems(mergedProfile)}
          />
        );
        break;
      }
      case "RATES": {
        let profile = this.props.fcConfig.currentRateProfile;
        mergedProfile = Object.assign(
          {},
          mergedProfile,
          mergedProfile.rate_profile.values[profile]
        );
        contents = (
          <RatesView
            fcConfig={mergedProfile}
            changeProfile={newProfile => {
              this.notifyDirty(
                true,
                mergedProfile.currentRateProfile,
                newProfile
              );
              FCConnector.changeProfile("rate", newProfile).then(() => {
                this.props.fcConfig.currentRateProfile = newProfile;
                this.forceUpdate();
              });
            }}
            notifyDirty={(isDirty, item, newValue) =>
              this.notifyDirty(isDirty, item, newValue)
            }
            id={"rate_profile"}
            active={mergedProfile.currentRateProfile}
            profileList={mergedProfile.rateProfileList}
            items={this.getRouteItems(mergedProfile)}
          />
        );
        break;
      }
      case "MODES":
        contents = (
          <AuxChannelView
            fcConfig={mergedProfile}
            auxScale={mergedProfile.rx_scale}
            auxModeList={mergedProfile.aux_channel_modes}
            modes={mergedProfile.modes && mergedProfile.modes.values}
            notifyDirty={(isDirty, item, newValue) =>
              this.notifyDirty(isDirty, item, newValue)
            }
          />
        );
        break;
      case "MOTORS":
        contents = (
          <MotorsView
            features={this.getRouteFeatures("MOTORS")}
            items={this.getRouteItems(mergedProfile, true)}
            fcConfig={mergedProfile}
            openAssistant={name => this.openAssistant(name)}
            notifyDirty={(isDirty, item, newValue) =>
              this.notifyDirty(isDirty, item, newValue)
            }
          />
        );
        break;
      case "RX":
        contents = (
          <RXView
            features={this.getRouteFeatures("RX")}
            items={this.getRouteItems(mergedProfile, true)}
            fcConfig={mergedProfile}
            openAssistant={name => this.openAssistant(name)}
            notifyDirty={(isDirty, item, newValue) =>
              this.notifyDirty(isDirty, item, newValue)
            }
          />
        );
        break;
      case "PORTS":
        contents = (
          <PortsView
            rxProvider={mergedProfile.serialrx_provider}
            ports={mergedProfile.ports.values}
            notifyDirty={(isDirty, item, newValue) =>
              this.notifyDirty(isDirty, item, newValue)
            }
          />
        );
        break;
      case "OSD":
        contents = (
          <OSDView
            fcConfig={mergedProfile}
            notifyDirty={(isDirty, item, newValue) =>
              this.notifyDirty(isDirty, item, newValue)
            }
            items={this.getRouteItems(mergedProfile, true)}
          />
        );
        break;
      case "BLACKBOX":
        contents = (
          <BlackboxView
            storageCommand="msc"
            items={this.getRouteItems(mergedProfile, true)}
            notifyDirty={(isDirty, item, newValue) =>
              this.notifyDirty(isDirty, item, newValue)
            }
          />
        );
        break;
      case "FEATURES":
        contents = (
          <FeaturesView
            features={mergedProfile.features.values}
            fcConfig={mergedProfile}
            notifyDirty={(isDirty, item, newValue) =>
              this.notifyDirty(isDirty, item, newValue)
            }
          />
        );
        break;
      case "FILTERS":
        contents = (
          <FiltersView
            features={this.getRouteFeatures("FILTERS")}
            fcConfig={mergedProfile}
            notifyDirty={(isDirty, item, newValue) =>
              this.notifyDirty(isDirty, item, newValue)
            }
          />
        );
        break;
      default:
        contents = (
          <ConfigListView
            fcConfig={mergedProfile}
            features={this.getRouteFeatures(this.state.currentRoute.key)}
            notifyDirty={(isDirty, item, newValue) =>
              this.notifyDirty(isDirty, item, newValue)
            }
            items={this.getRouteItems(mergedProfile, true)}
          />
        );
        break;
    }

    return (
      <Paper className={`connected-root ${mergedProfile.version.fw}`}>
        <FCConfigContext.Provider value={mergedProfile}>
          <AppBarView
            rebooting={this.props.rebooting}
            position="absolute"
            handleDrawerToggle={this.handleDrawerToggle}
            handleSearch={this.handleSearch}
            onSave={this.handleSave}
            notifyDirty={(isDirty, item, newValue) =>
              this.notifyDirty(isDirty, item, newValue)
            }
            title={this.state.currentRoute.title}
            fcConfig={mergedProfile}
            isDirty={this.state.isDirty}
          />
          <DrawerView
            routes={this.routes}
            goToImuf={this.props.goToImuf}
            fcConfig={mergedProfile}
            open={this.state.drawerOpen}
            onClose={() => {
              this.setState({ drawerOpen: false });
            }}
            handleMenuItemClick={this.handleMenuItemClick}
          />
          {contents}
          <CliView handleSave={this.handleSave} theme={this.state.theme} />
          {this.state.openAssistant && (
            <AssistantView
              rebooting={this.props.rebooting}
              fcConfig={mergedProfile}
              handleSave={this.handleSave}
              theme={this.state.theme}
              fw={mergedProfile.version.fw.indexOf("B") > -1 ? "bxf" : "rf1"}
              open={this.state.openAssistant}
              onClose={() => this.closeAssistant()}
              type={this.state.assistantType}
            />
          )}
        </FCConfigContext.Provider>
      </Paper>
    );
  }
}

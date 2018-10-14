import React, { Component } from "react";
import Drawer from "@material-ui/core/Drawer";
import MenuItem from "@material-ui/core/MenuItem";
import Paper from "@material-ui/core/Paper";
import List from "@material-ui/core/List";
import Divider from "@material-ui/core/Divider";
import Badge from "@material-ui/core/Badge";
import Typography from "@material-ui/core/Typography";
import VersionInfoView from "./VersionInfoView";
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
import ProfileView from "./ProfileView/ProfileView";
import BlackboxView from "./BlackboxView/BlackboxView";
import RXView from "./RXView/RXView";
import MotorsView from "./MotorsView/MotorsView";
import OSDView from "./OSDView/OSDView";
import { FormattedMessage } from "react-intl";
import "./Connected.css";
import { FCConfigContext } from "../App";
import PreFlightCheckView from "./PreFlightCheckView/PreFlightCheckView";

export default class Connected extends Component {
  constructor(props) {
    super(props);
    this.routes = props.fcConfig.routes;
    this.routeFeatures = props.fcConfig.routeFeatures;
    this.state = {
      theme: props.theme,
      isBxF: props.fcConfig.isBxF,
      fcConfig: props.fcConfig,
      pid_profile: props.fcConfig.currentPidProfile,
      rate_profile: props.fcConfig.currentRateProfile,
      craftName: props.fcConfig.name,
      isDirty: false,
      drawerOpen: false,
      currentRoute: props.fcConfig.startingRoute
    };
  }

  getRouteFeatures(key) {
    if (this.state.fcConfig.isBxF && this.routeFeatures[key]) {
      return this.state.fcConfig.features.values
        .filter(feat => {
          return this.routeFeatures[key].indexOf(feat.id) > -1;
        })
        .map(feature => {
          if (feature.hasPort) {
            feature.ports = this.state.fcConfig.ports;
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
    this.setState({ openAssistant: true, assistantType: routeName });
  }
  closeAssistant() {
    this.setState({ openAssistant: false, assistantType: "" });
  }
  render() {
    let contents;

    switch (this.state.currentRoute.key) {
      case "PFC":
        contents = (
          <FCConfigContext.Provider value={this.state.fcConfig}>
            <PreFlightCheckView
              fcConfig={this.state.fcConfig}
              handleSave={this.handleSave}
            />
          </FCConfigContext.Provider>
        );
        break;
      case "PID": {
        let mergedProfile = Object.assign(
          {},
          this.state.fcConfig,
          this.state.fcConfig.pid_profile.values[this.state.pid_profile]
        );
        contents = (
          <FCConfigContext.Provider value={mergedProfile}>
            <PidsView
              fcConfig={mergedProfile}
              isBxF={this.state.fcConfig.isBxF}
              handleSave={this.handleSave}
              changeProfile={newProfile => {
                this.notifyDirty(
                  true,
                  this.props.fcConfig.currentPidProfile,
                  newProfile
                );
                FCConnector.changeProfile("pid", newProfile).then(() => {
                  this.props.fcConfig.currentPidProfile = newProfile;
                  this.setState({ pid_profile: newProfile });
                });
              }}
              notifyDirty={(isDirty, item, newValue) =>
                this.notifyDirty(isDirty, item, newValue)
              }
              id="pid_profile"
              active={this.state.pid_profile}
              profileList={this.state.fcConfig.pidProfileList}
              items={this.getRouteItems(mergedProfile)}
            />
          </FCConfigContext.Provider>
        );
        break;
      }
      case "RATES": {
        let mergedProfile = Object.assign(
          {},
          this.state.fcConfig,
          this.state.fcConfig.rate_profile.values[this.state.rate_profile]
        );
        contents = (
          <FCConfigContext.Provider value={mergedProfile}>
            <RatesView
              fcConfig={mergedProfile}
              changeProfile={newProfile => {
                this.notifyDirty(
                  true,
                  this.props.fcConfig.currentRateProfile,
                  newProfile
                );
                FCConnector.changeProfile("rate", newProfile).then(() => {
                  this.props.fcConfig.currentRateProfile = newProfile;
                  this.setState({ rate_profile: newProfile });
                });
              }}
              notifyDirty={(isDirty, item, newValue) =>
                this.notifyDirty(isDirty, item, newValue)
              }
              id={"rate_profile"}
              active={this.state.rate_profile}
              profileList={this.state.fcConfig.rateProfileList}
              items={this.getRouteItems(mergedProfile)}
            />
          </FCConfigContext.Provider>
        );
        break;
      }
      case "MODES":
        contents = (
          <FCConfigContext.Provider value={this.state.fcConfig}>
            <AuxChannelView
              fcConfig={this.state.fcConfig}
              auxScale={this.state.fcConfig.rx_scale}
              auxModeList={this.state.fcConfig.aux_channel_modes}
              modes={
                this.state.fcConfig.modes && this.state.fcConfig.modes.values
              }
              notifyDirty={(isDirty, item, newValue) =>
                this.notifyDirty(isDirty, item, newValue)
              }
            />
          </FCConfigContext.Provider>
        );
        break;
      case "MOTORS":
        contents = (
          <FCConfigContext.Provider value={this.state.fcConfig}>
            <MotorsView
              features={this.getRouteFeatures("MOTORS")}
              items={this.getRouteItems(this.state.fcConfig, true)}
              fcConfig={this.state.fcConfig}
              openAssistant={name => this.openAssistant(name)}
              notifyDirty={(isDirty, item, newValue) =>
                this.notifyDirty(isDirty, item, newValue)
              }
            />
          </FCConfigContext.Provider>
        );
        break;
      case "RX":
        contents = (
          <FCConfigContext.Provider value={this.state.fcConfig}>
            <RXView
              features={this.getRouteFeatures("RX")}
              items={this.getRouteItems(this.state.fcConfig, true)}
              fcConfig={this.state.fcConfig}
              openAssistant={name => this.openAssistant(name)}
              notifyDirty={(isDirty, item, newValue) =>
                this.notifyDirty(isDirty, item, newValue)
              }
            />
          </FCConfigContext.Provider>
        );
        break;
      case "PORTS":
        contents = (
          <FCConfigContext.Provider value={this.state.fcConfig}>
            <PortsView
              rxProvider={this.state.fcConfig.serialrx_provider}
              ports={this.state.fcConfig.ports.values}
              notifyDirty={(isDirty, item, newValue) =>
                this.notifyDirty(isDirty, item, newValue)
              }
            />
          </FCConfigContext.Provider>
        );
        break;
      case "OSD":
        contents = (
          <FCConfigContext.Provider value={this.state.fcConfig}>
            <OSDView
              fcConfig={this.state.fcConfig}
              notifyDirty={(isDirty, item, newValue) =>
                this.notifyDirty(isDirty, item, newValue)
              }
              items={this.getRouteItems(this.state.fcConfig, true)}
            />
          </FCConfigContext.Provider>
        );
        break;
      case "BLACKBOX":
        contents = (
          <FCConfigContext.Provider value={this.state.fcConfig}>
            <BlackboxView
              items={this.getRouteItems(this.state.fcConfig, true)}
              notifyDirty={(isDirty, item, newValue) =>
                this.notifyDirty(isDirty, item, newValue)
              }
            />
          </FCConfigContext.Provider>
        );
        break;
      case "FEATURES":
        contents = (
          <FCConfigContext.Provider value={this.state.fcConfig}>
            <FeaturesView
              features={this.state.fcConfig.features.values}
              fcConfig={this.state.fcConfig}
              notifyDirty={(isDirty, item, newValue) =>
                this.notifyDirty(isDirty, item, newValue)
              }
            />
          </FCConfigContext.Provider>
        );
        break;
      case "FILTERS":
        if (this.state.isBxF) {
          contents = (
            <FCConfigContext.Provider value={this.state.fcConfig}>
              <FiltersView
                features={this.getRouteFeatures("FILTERS")}
                fcConfig={this.state.fcConfig}
                notifyDirty={(isDirty, item, newValue) =>
                  this.notifyDirty(isDirty, item, newValue)
                }
              />
            </FCConfigContext.Provider>
          );
        } else {
          let mergedProfile = Object.assign(
            {},
            this.state.fcConfig,
            this.state.fcConfig.pid_profile.values[this.state.pid_profile]
          );
          contents = (
            <FCConfigContext.Provider value={mergedProfile}>
              <ProfileView
                id="filter_profile"
                active={this.state.pid_profile}
                profileList={this.state.fcConfig.pidProfileList}
                fcConfig={this.state.fcConfig}
                notifyDirty={(isDirty, item, newValue) =>
                  this.notifyDirty(isDirty, item, newValue)
                }
                changeProfile={newProfile => {
                  FCConnector.changeProfile("pid", newProfile).then(() => {
                    this.setState({ pid_profile: newProfile });
                  });
                }}
                items={this.getRouteItems(mergedProfile)}
              />
            </FCConfigContext.Provider>
          );
        }
        break;
      default:
        contents = (
          <FCConfigContext.Provider value={this.state.fcConfig}>
            <ConfigListView
              fcConfig={this.props.fcConfig}
              features={this.getRouteFeatures(this.state.currentRoute.key)}
              notifyDirty={(isDirty, item, newValue) =>
                this.notifyDirty(isDirty, item, newValue)
              }
              items={this.getRouteItems(this.state.fcConfig, true)}
            />
          </FCConfigContext.Provider>
        );
        break;
    }

    return (
      <Paper
        theme={this.state.theme}
        elevation={3}
        className={`connected-root ${this.state.fcConfig.version.fw}`}
      >
        <FCConfigContext.Provider value={this.state.fcConfig}>
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
            fcConfig={this.state.fcConfig}
            isDirty={this.state.isDirty}
          />
          <Drawer
            open={this.state.drawerOpen}
            onClose={() => {
              this.setState({ drawerOpen: false });
            }}
          >
            <Divider style={{ marginTop: "30px" }} />
            <VersionInfoView
              goToImuf={this.props.goToImuf}
              version={this.state.fcConfig.version}
              imuf={this.state.fcConfig.imuf}
            />
            <Divider />
            <List style={{ display: "block" }}>
              {this.routes.map(route => {
                return (
                  <MenuItem
                    style={{ padding: 8 }}
                    id={route.key}
                    key={route.key}
                    onClick={() => this.handleMenuItemClick(route.key)}
                  >
                    <Typography variant="subheading" style={{ flexGrow: 1 }}>
                      <FormattedMessage id={"route." + route.key} />
                    </Typography>
                    {route.incompeteItems && (
                      <Badge
                        style={{ top: "12px" }}
                        badgeContent={route.incompeteItems}
                        secondary={true}
                      />
                    )}
                  </MenuItem>
                );
              })}
            </List>
          </Drawer>
        </FCConfigContext.Provider>
        {contents}
        <CliView handleSave={this.handleSave} theme={this.state.theme} />
        {this.state.openAssistant && (
          <AssistantView
            rebooting={this.props.rebooting}
            fcConfig={this.state.fcConfig}
            handleSave={this.handleSave}
            theme={this.state.theme}
            fw={
              this.state.fcConfig.version.fw.indexOf("B") > -1 ? "bxf" : "rf1"
            }
            open={this.state.openAssistant}
            onClose={() => this.closeAssistant()}
            type={this.state.assistantType}
          />
        )}
      </Paper>
    );
  }
}

import React, { Component } from "react";
import Drawer from "@material-ui/core/Drawer";
import MenuItem from "@material-ui/core/MenuItem";
import Paper from "@material-ui/core/Paper";
import List from "@material-ui/core/List";
import Divider from "@material-ui/core/Divider";
import Badge from "@material-ui/core/Badge";
import Assistant from "@material-ui/icons/Assistant";
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

const skipprops = [
  "pid_profile",
  "rate_profile",
  "modes",
  "features",
  "ports",
  "imuf",
  "name",
  "version",
  "pidProfileList",
  "rateProfileList",
  "currentPidProfile",
  "currentRateProfile",
  "startingRoute",
  "tpa_curves",
  "pinio_box",
  "pinio_config"
];
const getRouteItems = (routeName, fcConfig) => {
  return Object.keys(fcConfig)
    .filter(key => {
      if (routeName === "ADVANCED") {
        return skipprops.indexOf(key) < 0 && !fcConfig[key].route;
      }
      return fcConfig[key].route === routeName;
    })
    .map(k => fcConfig[k]);
};

export default class Connected extends Component {
  constructor(props) {
    super(props);
    this.routes = props.fcConfig.routes;
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

  handleDrawerToggle = () => {
    this.setState({ drawerOpen: !this.state.drawerOpen });
  };
  handleSearch = () => {
    //TODO: filter config values based on text.
  };
  handleSave = () => {
    FCConnector.saveConfig().then(() => {
      this.setState({ isDirty: false });
    });
  };

  handleMenuItemClick = key => {
    let newRoute = this.routes.find(route => route.key === key);
    if (this.state.isDirty) {
      // this.handleSave();
      //TODO: save EEPROM
    }
    this.setState({
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
      case "PID": {
        let mergedProfile = Object.assign(
          {},
          this.state.fcConfig,
          this.state.fcConfig.pid_profile.values[this.state.pid_profile]
        );
        contents = (
          <PidsView
            fcConfig={mergedProfile}
            changeProfile={newProfile => {
              FCConnector.changeProfile("pid", newProfile).then(() => {
                this.props.fcConfig.currentPidProfile = newProfile;
                this.setState({ pid_profile: newProfile });
              });
            }}
            notifyDirty={(isDirty, item, newValue) =>
              this.notifyDirty(isDirty, item, newValue)
            }
            id={"pid_profile"}
            active={this.state.pid_profile}
            profileList={this.state.fcConfig.pidProfileList}
            items={getRouteItems(this.state.currentRoute.key, mergedProfile)}
          />
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
          <RatesView
            fcConfig={mergedProfile}
            changeProfile={newProfile => {
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
            items={getRouteItems(this.state.currentRoute.key, mergedProfile)}
          />
        );
        break;
      }
      case "MODES":
        contents = (
          <AuxChannelView
            modes={this.state.fcConfig.modes.values}
            notifyDirty={(isDirty, item, newValue) =>
              this.notifyDirty(isDirty, item, newValue)
            }
          />
        );
        break;
      case "MOTORS":
        contents = (
          <MotorsView
            items={getRouteItems(
              this.state.currentRoute.key,
              this.state.fcConfig
            )}
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
            items={getRouteItems(
              this.state.currentRoute.key,
              this.state.fcConfig
            )}
            fcConfig={this.state.fcConfig}
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
            rxProvider={this.state.fcConfig.serialrx_provider}
            ports={this.state.fcConfig.ports.values}
            notifyDirty={(isDirty, item, newValue) =>
              this.notifyDirty(isDirty, item, newValue)
            }
          />
        );
        break;
      case "OSD":
        contents = (
          <OSDView
            fcConfig={this.state.fcConfig}
            notifyDirty={(isDirty, item, newValue) =>
              this.notifyDirty(isDirty, item, newValue)
            }
            items={getRouteItems(
              this.state.currentRoute.key,
              this.state.fcConfig
            )}
          />
        );
        break;
      case "BLACKBOX":
        contents = (
          <BlackboxView
            items={getRouteItems(
              this.state.currentRoute.key,
              this.state.fcConfig
            )}
            notifyDirty={(isDirty, item, newValue) =>
              this.notifyDirty(isDirty, item, newValue)
            }
          />
        );
        break;
      case "FEATURES":
        contents = (
          <FeaturesView
            features={this.state.fcConfig.features.values}
            notifyDirty={(isDirty, item, newValue) =>
              this.notifyDirty(isDirty, item, newValue)
            }
          />
        );
        break;
      case "FILTERS":
        if (this.state.isBxF) {
          contents = (
            <FiltersView
              fcConfig={this.state.fcConfig}
              notifyDirty={(isDirty, item, newValue) =>
                this.notifyDirty(isDirty, item, newValue)
              }
            />
          );
        } else {
          let mergedProfile = Object.assign(
            {},
            this.state.fcConfig,
            this.state.fcConfig.pid_profile.values[this.state.pid_profile]
          );
          contents = (
            <ProfileView
              id={"filter_profile"}
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
              items={getRouteItems(this.state.currentRoute.key, mergedProfile)}
            />
          );
        }
        break;
      default:
        contents = (
          <ConfigListView
            notifyDirty={(isDirty, item, newValue) =>
              this.notifyDirty(isDirty, item, newValue)
            }
            items={getRouteItems(
              this.state.currentRoute.key,
              this.state.fcConfig
            )}
          />
        );
        break;
    }

    return (
      <Paper
        theme={this.state.theme}
        elevation={3}
        style={{
          display: "flex",
          flexDirection: "column",
          position: "relative",
          flex: "1",
          padding: "100px 10px 10px 10px",
          minHeight: "100%",
          boxSizing: "border-box"
        }}
      >
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
                <MenuItem id={route.key} key={route.key}>
                  <div
                    style={{ flexGrow: 1 }}
                    onClick={() => this.handleMenuItemClick(route.key)}
                  >
                    <FormattedMessage id={route.key} />
                  </div>
                  {route.incompeteItems && (
                    <Badge
                      style={{ top: "12px" }}
                      badgeContent={route.incompeteItems}
                      secondary={true}
                    />
                  )}
                  {route.assistant && (
                    <Assistant
                      style={{ marginLeft: 10 }}
                      onClick={() => this.openAssistant(route.key)}
                    />
                  )}
                </MenuItem>
              );
            })}
          </List>
        </Drawer>
        {contents}
        <CliView theme={this.state.theme} />
        {this.state.openAssistant && (
          <AssistantView
            fcConfig={this.state.fcConfig}
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

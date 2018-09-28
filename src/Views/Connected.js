import React, { Component } from "react";
import Drawer from "@material-ui/core/Drawer";
import MenuItem from "@material-ui/core/MenuItem";
import Paper from "@material-ui/core/Paper";
import List from "@material-ui/core/List";
import Divider from "@material-ui/core/Divider";
import Badge from "@material-ui/core/Badge";
import AccessibleForward from "@material-ui/icons/AccessibleForward";
import theme from "../Themes/Dark";
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
    this.fcConfig = props.fcConfig;
    this.goToImuf = props.goToImuf;

    this.routes = this.fcConfig.routes;
    this.state = {
      pid_profile: this.fcConfig.currentPidProfile,
      rate_profile: this.fcConfig.currentRateProfile,
      craftName: this.fcConfig.name,
      isDirty: false,
      drawerOpen: false,
      currentRoute: this.fcConfig.startingRoute
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

  handleMenuItemClick = event => {
    let newRoute = this.routes.find(
      route => route.key === event.target.textContent
    );
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
    let updateObj = {
      isDirty: isDirty
    };
    updateObj[item.id] = newValue;
    this.setState(updateObj);
  };

  openAssistant(routeName) {
    this.setState({ openAssistant: true, assistantType: routeName });
  }
  closeAssistant() {
    this.setState({ openAssistant: false, assistantType: "" });
  }
  render() {
    let contents;
    if (this.props.device.hid) {
      let routeItems = getRouteItems(
        this.state.currentRoute.key,
        this.fcConfig
      );
      contents = (
        <ConfigListView
          notifyDirty={(isDirty, item, newValue) =>
            this.notifyDirty(isDirty, item, newValue)
          }
          items={routeItems}
        />
      );
    } else {
      switch (this.state.currentRoute.key) {
        case "PID": {
          let mergedProfile = Object.assign(
            {},
            this.fcConfig,
            this.fcConfig.pid_profile.values[this.state.pid_profile]
          );
          contents = (
            <PidsView
              fcConfig={this.fcConfig}
              notifyDirty={(isDirty, item, newValue) =>
                this.notifyDirty(isDirty, item, newValue)
              }
              id={"pid_profile"}
              active={this.state.pid_profile}
              profileList={this.fcConfig.pidProfileList}
              items={getRouteItems(this.state.currentRoute.key, mergedProfile)}
            />
          );
          break;
        }
        case "RATES": {
          let mergedProfile = Object.assign(
            {},
            this.fcConfig,
            this.fcConfig.rate_profile.values[this.state.rate_profile]
          );
          contents = (
            <RatesView
              fcConfig={this.fcConfig}
              notifyDirty={(isDirty, item, newValue) =>
                this.notifyDirty(isDirty, item, newValue)
              }
              id={"rate_profile"}
              active={this.state.rate_profile}
              profileList={this.fcConfig.rateProfileList}
              items={getRouteItems(this.state.currentRoute.key, mergedProfile)}
            />
          );
          break;
        }
        case "MODES":
          contents = (
            <AuxChannelView
              modes={this.fcConfig.modes.values}
              notifyDirty={(isDirty, item, newValue) =>
                this.notifyDirty(isDirty, item, newValue)
              }
            />
          );
          break;
        case "PORTS":
          contents = (
            <PortsView
              rxProvider={this.fcConfig.serialrx_provider}
              ports={this.fcConfig.ports.values}
              notifyDirty={(isDirty, item, newValue) =>
                this.notifyDirty(isDirty, item, newValue)
              }
            />
          );
          break;
        case "FEATURES":
          contents = (
            <FeaturesView
              features={this.fcConfig.features.values}
              notifyDirty={(isDirty, item, newValue) =>
                this.notifyDirty(isDirty, item, newValue)
              }
            />
          );
          break;
        case "FILTERS":
          contents = (
            <FiltersView
              fcConfig={this.fcConfig}
              features={this.fcConfig.features.values}
              notifyDirty={(isDirty, item, newValue) =>
                this.notifyDirty(isDirty, item, newValue)
              }
            />
          );
          break;
        default:
          contents = (
            <ConfigListView
              notifyDirty={(isDirty, item, newValue) =>
                this.notifyDirty(isDirty, item, newValue)
              }
              items={getRouteItems(this.state.currentRoute.key, this.fcConfig)}
            />
          );
          break;
      }
    }

    return (
      <Paper
        theme={theme}
        elevation={3}
        style={{
          display: "flex",
          flexDirection: "column",
          position: "relative",
          flex: "1",
          padding: "30px 10px 10px 10px",
          minHeight: "100%",
          boxSizing: "border-box"
        }}
      >
        <AppBarView
          position="absolute"
          handleDrawerToggle={this.handleDrawerToggle}
          handleSearch={this.handleSearch}
          onSave={this.handleSave}
          notifyDirty={(isDirty, item, newValue) =>
            this.notifyDirty(isDirty, item, newValue)
          }
          title={this.state.currentRoute.title}
          fcConfig={this.fcConfig}
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
            goToImuf={this.goToImuf}
            version={this.fcConfig.version}
            imuf={this.fcConfig.imuf}
          />
          <Divider />
          <List>
            {this.routes.map(route => {
              return (
                <MenuItem style={{ width: 100 }} id={route.key} key={route.key}>
                  <div
                    style={{ flexGrow: 1 }}
                    onClick={this.handleMenuItemClick}
                  >
                    {route.title}
                  </div>
                  {route.incompeteItems && (
                    <Badge
                      style={{ top: "12px" }}
                      badgeContent={route.incompeteItems}
                      secondary={true}
                    />
                  )}
                  {route.assistant && (
                    <AccessibleForward
                      onClick={() => this.openAssistant(route.key)}
                    />
                  )}
                </MenuItem>
              );
            })}
          </List>
        </Drawer>
        {contents}
        <CliView />
        {this.state.openAssistant && (
          <AssistantView
            open={this.state.openAssistant}
            onClose={() => this.closeAssistant()}
            type={this.state.assistantType}
          />
        )}
      </Paper>
    );
  }
}

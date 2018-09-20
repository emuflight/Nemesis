import React, { Component } from "react";
import AppBar from "material-ui/AppBar";
import Drawer from "material-ui/Drawer";
import Badge from "material-ui/Badge";
import MenuItem from "material-ui/MenuItem";
import Paper from "material-ui/Paper";
import List from "material-ui/List";
import Divider from "material-ui/Divider";
import InfoBarView from "./InfoBarView";
import VersionInfoView from "./VersionInfoView";
import AuxChannelView from "./AuxChannelView/AuxChannelView";
import ConfigListView from "./ConfigListView/ConfigListView";
import FeaturesView from "./FeaturesView/FeaturesView";
import PortsView from "./PortsView/PortsView";
import CliView from "./CliView/CliView";
import FiltersView from "./FiltersView/FiltersView";
import PidsView from "./PidView/PidView";
import RatesView from "./RatesView/RatesView";

const getRouteItems = (routeName, fcConfig, uiConfig) => {
  return Object.keys(fcConfig)
    .filter(key => {
      return uiConfig.groups[routeName].indexOf(key) !== -1;
    })
    .map(k => {
      let itemObj = Object.assign(
        {
          id: k,
          element: uiConfig.elements[k]
        },
        fcConfig[k]
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
    });
};

export default class Connected extends Component {
  constructor(props) {
    super(props);
    this.fcConfig = props.fcConfig;
    this.uiConfig = props.uiConfig;
    this.goToDFU = props.goToDFU;
    this.goToImuf = props.goToImuf;

    let currentPidProfile = parseInt(this.fcConfig.pid_profile.current, 10);
    let currentRateProfile = parseInt(this.fcConfig.rate_profile.current, 10);

    this.state = {
      pid_profile: currentPidProfile,
      rate_profile: currentRateProfile,
      craftName: this.fcConfig.name,
      isDirty: false,
      drawerOpen: false,
      currentRoute: props.uiConfig.routes[0]
    };
  }

  handleDrawerToggle = () => {
    this.setState({ drawerOpen: !this.state.drawerOpen });
  };

  handleMenuItemClick = event => {
    let newRoute = this.uiConfig.routes.find(
      route => route.key === event.currentTarget.id
    );
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
  render() {
    let contents;
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
            uiConfig={this.uiConfig}
            notifyDirty={(isDirty, item, newValue) =>
              this.notifyDirty(isDirty, item, newValue)
            }
            id={"pid_profile"}
            active={this.state.pid_profile}
            profileList={this.fcConfig.pid_profile.values.map((v, k) => {
              return {
                label: `Profile ${k + 1}`,
                value: k
              };
            })}
            items={getRouteItems(
              this.state.currentRoute.key,
              mergedProfile,
              this.uiConfig
            )}
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
            profileList={this.fcConfig.rate_profile.values.map((v, k) => {
              return {
                label: `Rate Profile ${k + 1}`,
                value: k
              };
            })}
            items={getRouteItems(
              this.state.currentRoute.key,
              mergedProfile,
              this.uiConfig
            )}
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
            items={getRouteItems(
              this.state.currentRoute.key,
              this.fcConfig,
              this.uiConfig
            )}
          />
        );
        break;
    }
    return (
      <Paper
        style={{
          display: "flex",
          flexDirection: "column",
          position: "relative",
          flex: "1",
          padding: "10px",
          minHeight: "100%"
        }}
      >
        <InfoBarView
          handleDrawerToggle={this.handleDrawerToggle}
          fcConfig={this.fcConfig}
          isDirty={this.state.isDirty}
        />
        <AppBar
          title={this.state.currentRoute.title}
          onLeftIconButtonClick={this.handleDrawerToggle}
        />
        <Drawer
          docked={false}
          open={this.state.drawerOpen}
          onRequestChange={drawerOpen => {
            this.setState({ drawerOpen });
          }}
        >
          <VersionInfoView
            goToDFU={this.goToDFU}
            goToImuf={this.goToImuf}
            version={this.fcConfig.version}
            imuf={this.fcConfig.imuf}
          />
          <Divider />
          {this.uiConfig.routes.map(route => {
            return (
              <MenuItem
                id={route.key}
                key={route.key}
                onClick={this.handleMenuItemClick}
              >
                <List style={{ display: "flex" }}>
                  <div style={{ flex: 1 }}>{route.title}</div>
                  {route.incompeteItems && (
                    <Badge
                      style={{ top: "12px" }}
                      badgeContent={route.incompeteItems}
                      secondary={true}
                    />
                  )}
                </List>
              </MenuItem>
            );
          })}
        </Drawer>
        {contents}
        <CliView />
      </Paper>
    );
  }
}

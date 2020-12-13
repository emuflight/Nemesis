import React, { Component } from "react";
import Paper from "@material-ui/core/Paper";
import ConfigListView from "./ConfigListView/ConfigListView";
import CliView from "./CliView/CliView";
import FCConnector from "../utilities/FCConnector";
import AssistantView from "./Assistants/AssistantView";
import "./Connected.css";
import { FCConfigContext } from "../App";
import ResponsiveDrawerView from "./ResponsiveDrawerView";
import Typography from "@material-ui/core/Typography";

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
      mobileOpen: false,
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
    if (this.state.mobileOpen) {
      FCConnector.pauseTelemetry();
    } else {
      FCConnector.resumeTelemetry();
    }
    this.setState({ mobileOpen: !this.state.mobileOpen });
  };

  handleClickAway = () => {
    if (this.state.mobileOpen) {
      this.setState({ mobileOpen: false });
    }
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
      mobileOpen: false,
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
          <Paper>
            <div>
              <Typography variant="h5">IMUF only version</Typography>
            </div>
          </Paper>
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
          <ResponsiveDrawerView
            routes={this.routes}
            goToImuf={this.props.goToImuf}
            fcConfig={mergedProfile}
            mobileOpen={this.state.mobileOpen}
            onClose={() => {
              this.setState({ mobileOpen: false });
            }}
            handleMenuItemClick={this.handleMenuItemClick}
            handleClickAway={this.handleClickAway}
            appVersion={this.props.appVersion}
          />
          {contents}
        </FCConfigContext.Provider>
      </Paper>
    );
  }
}

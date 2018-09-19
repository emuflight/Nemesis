import React, { Component } from "react";
import AppBar from "material-ui/AppBar";
import Drawer from "material-ui/Drawer";
import Badge from "material-ui/Badge";
import MenuItem from "material-ui/MenuItem";
import Divider from "material-ui/Divider";
import dynamicRoute from "./DynamicRoute";
import InfoBarView from "./InfoBarView";
import VersionInfoView from "./VersionInfoView";

export default class Connected extends Component {
  constructor(props) {
    super(props);
    this.fcConfig = props.fcConfig;
    this.uiConfig = props.uiConfig;
    this.goToDFU = props.goToDFU;
    this.goToImuf = props.goToImuf;
    this.state = {
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
    let notification = document.getElementById(item.id);
    if (notification) {
      notification.dispatchEvent(
        new CustomEvent("change", { detail: { item, newValue } })
      );
    }
    this.setState({ isDirty });
  };

  render() {
    return (
      <div style={{ display: "flex", flexDirection: "column" }}>
        <InfoBarView
          handleDrawerToggle={this.handleDrawerToggle}
          fcConfig={this.fcConfig}
          isDirty={this.state.isDirty}
        />
        <AppBar
          title={this.state.currentRoute.title}
          onLeftIconButtonClick={this.handleDrawerToggle}
        />
        <Drawer open={this.state.drawerOpen}>
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
                <div style={{ display: "flex" }}>
                  <div style={{ flex: 1 }}>{route.title}</div>
                  {route.incompeteItems && (
                    <Badge
                      style={{ top: "12px" }}
                      badgeContent={route.incompeteItems}
                      secondary={true}
                    />
                  )}
                </div>
              </MenuItem>
            );
          })}
        </Drawer>

        {dynamicRoute(
          this.state,
          this.fcConfig,
          this.uiConfig,
          this.notifyDirty
        )}
      </div>
    );
  }
}

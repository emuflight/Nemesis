import React, { Component } from "react";
import AppBar from "material-ui/AppBar";
import Drawer from "material-ui/Drawer";
import MenuItem from "material-ui/MenuItem";
import FlatButton from "material-ui/FlatButton";
import ConfigListView from "./ConfigListView";
import FCConnector from "../utilities/FCConnector";
import VersionInfoView from "./VersionInfoView";

export default class Connected extends Component {
  constructor(props) {
    super(props);
    this.fcConfig = props.fcConfig;
    this.uiConfig = props.uiConfig;
    this.goToDFU = props.goToDFU;
    this.goToImuf = props.goToImuf;
    this.state = {
      isDirty: false,
      drawerOpen: false,
      currentRoute: props.uiConfig.routes[0],
      routeItems: props.uiConfig.routes[0].items
    };
  }

  handleDrawerToggle = () => {
    this.setState({ drawerOpen: !this.state.drawerOpen });
  };

  handleSaveClick = () => {
    FCConnector.saveConfig().then(() => {
      this.setState({ isDirty: false });
    });
  };

  handleMenuItemClick = event => {
    let newRoute = this.uiConfig.routes.find(
      route => route.key === event.currentTarget.id
    );
    this.setState({
      drawerOpen: false,
      currentRoute: newRoute,
      routeItems: newRoute.items
    });
  };

  notifyDirty(isDirty, item, newValue) {
    let notification = document.getElementById(item.id);
    if (notification) {
      notification.dispatchEvent(
        new CustomEvent("change", { detail: { item, newValue } })
      );
    }
    this.setState({ isDirty });
  }

  render() {
    return (
      <div>
        <AppBar
          title={this.state.currentRoute.title}
          onLeftIconButtonClick={() => this.handleDrawerToggle()}
          iconElementRight={<FlatButton label="Save" />}
          onRightIconButtonClick={() => this.handleSaveClick()}
        />
        <Drawer open={this.state.drawerOpen}>
          {this.uiConfig.routes.map(route => {
            return (
              <MenuItem
                id={route.key}
                key={route.key}
                onClick={this.handleMenuItemClick}
              >
                {route.title}
              </MenuItem>
            );
          })}
        </Drawer>
        <VersionInfoView
          goToDFU={this.goToDFU}
          goToImuf={this.goToImuf}
          version={this.fcConfig.version}
          imuf={this.fcConfig.imuf}
        />
        <ConfigListView
          notifyDirty={this.notifyDirty}
          items={this.state.routeItems}
        />
      </div>
    );
  }
}

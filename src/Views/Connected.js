import React, { Component } from "react";
import AppBar from "material-ui/AppBar";
import Drawer from "material-ui/Drawer";
import MenuItem from "material-ui/MenuItem";
import dynamicRoute from "./DynamicRoute";
import FCConnector from "../utilities/FCConnector";
import VersionInfoView from "./VersionInfoView";
import { RaisedButton, TextField } from "material-ui";

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

  handleSaveClick = () => {
    this.setState({ isDirty: false });
    FCConnector.saveConfig();
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

  notifyDirty(isDirty, item, newValue) {
    let notification = document.getElementById(item.id);
    if (notification) {
      notification.dispatchEvent(
        new CustomEvent("change", { detail: { item, newValue } })
      );
    }
    this.setState({ isDirty });
  }

  updateCraftName() {
    this.setState({ namingCraft: true });
    FCConnector.sendCommand(`name ${this.state.craftName}`).then(() => {
      this.setState({ namingCraft: false });
    });
  }
  render() {
    return (
      <div style={{ display: "flex", flexDirection: "column" }}>
        <div
          style={{
            display: "flex",
            flexDirection: "row-reverse",
            padding: "10px"
          }}
        >
          <RaisedButton
            label="Save"
            style={{ marginLeft: "10px" }}
            primary={true}
            disabled={!this.state.isDirty}
            onClick={() => this.handleSaveClick()}
          />
          <VersionInfoView
            goToDFU={this.goToDFU}
            goToImuf={this.goToImuf}
            version={this.fcConfig.version}
            imuf={this.fcConfig.imuf}
          />
          <div style={{ display: "flex", flex: "1", marginBottom: "10px" }}>
            <h4 style={{ position: "relative", margin: "0 10px", top: "15px" }}>
              Connected to:
            </h4>
            <TextField
              id="craft_name"
              placeholder="A craft has no name..."
              defaultValue={this.state.craftName}
              errorText={this.state.namingCraft && "Saving..."}
              errorStyle={{ color: "rgb(0, 188, 212)" }}
              onBlur={() => this.updateCraftName()}
              onChange={(event, newValue) =>
                this.setState({ craftName: newValue })
              }
            />
          </div>
        </div>
        <AppBar
          title={this.state.currentRoute.title}
          onLeftIconButtonClick={() => this.handleDrawerToggle()}
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

        {dynamicRoute(
          this.state,
          this.fcConfig,
          this.uiConfig,
          (isDirty, state, newValue) =>
            this.notifyDirty(isDirty, state, newValue)
        )}
      </div>
    );
  }
}

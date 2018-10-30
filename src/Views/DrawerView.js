import React, { Component } from "react";
import Drawer from "@material-ui/core/Drawer";
import MenuItem from "@material-ui/core/MenuItem";
import List from "@material-ui/core/List";
import Divider from "@material-ui/core/Divider";
import Badge from "@material-ui/core/Badge";
import Typography from "@material-ui/core/Typography";
import VersionInfoView from "./VersionInfoView";
import { FormattedMessage } from "react-intl";
import "./Connected.css";

export default class DrawerView extends Component {
  render() {
    return (
      <Drawer open={this.props.open} onClose={this.props.onClose}>
        <Divider style={{ marginTop: "30px" }} />
        <VersionInfoView
          goToImuf={this.props.goToImuf}
          version={this.props.fcConfig.version}
          imuf={this.props.fcConfig.imuf}
        />
        <Divider />
        <List style={{ display: "block" }}>
          {this.props.routes.map(route => {
            return (
              <MenuItem
                style={{ padding: 8 }}
                id={route.key}
                key={route.key}
                onClick={() => this.props.handleMenuItemClick(route.key)}
              >
                <Typography variant="subtitle1" style={{ flexGrow: 1 }}>
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
    );
  }
}

import React, { Component } from "react";
import List from "@material-ui/core/List";
import MenuItem from "@material-ui/core/MenuItem";
import Popover from "@material-ui/core/Popover";
import Button from "@material-ui/core/Button";
import Launch from "@material-ui/icons/Launch";
import FCConnector from "../utilities/FCConnector";

export default class VersionInfoView extends Component {
  constructor(props) {
    super(props);

    this.goToImuf = props.goToImuf;
    this.state = props.version;
    this.state.open = false;
  }

  handleClick = event => {
    // This prevents ghost click.
    event.preventDefault();
    this.setState({
      open: true,
      anchorEl: event.currentTarget
    });
  };

  handleRequestClose = () => {
    this.setState({
      open: false
    });
  };
  render() {
    return (
      <MenuItem style={{ display: "flex" }}>
        <Button onClick={this.handleClick}>Version Info</Button>
        <Popover
          open={this.state.open}
          anchorEl={this.state.anchorEl}
          anchorOrigin={{ horizontal: "left", vertical: "bottom" }}
          onClose={() => this.setState({ open: false })}
        >
          <List>
            <MenuItem>{"Firmware: " + this.state.fw}</MenuItem>
            <MenuItem>{"Target: " + this.state.target}</MenuItem>
            <MenuItem style={{ display: "flex" }}>
              <div style={{ flexGrow: 1 }}>
                {"Version: " + this.state.version}
              </div>
              <Launch onClick={() => FCConnector.goToDFU(this.state.target)} />
            </MenuItem>
            {this.state.imuf && (
              <MenuItem style={{ display: "flex" }}>
                <div style={{ flexGrow: 1 }}>
                  {"IMU-F Version: " + this.state.imuf}
                </div>
                <Launch onClick={() => this.goToImuf()} />
              </MenuItem>
            )}
          </List>
        </Popover>
      </MenuItem>
    );
  }
}

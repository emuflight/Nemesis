import React, { Component } from "react";
import Popover from "@material-ui/core/Popover";
import MenuItem from "@material-ui/core/MenuItem";
import List from "@material-ui/core/List";
import Button from "@material-ui/core/Button";
import FCConnector from "../utilities/FCConnector";

export default class TelemetryView extends Component {
  constructor(props) {
    super(props);

    FCConnector.webSockets.addEventListener("message", message => {
      try {
        let telemetry = JSON.parse(message.data);
        if (telemetry.telemetry) {
          this.setState({ telemetry });
        }
      } catch (ex) {
        console.warn("unable to parse telemetry", ex);
      }
    });
    this.state = {
      open: false,
      telemetry: {
        gyro: {
          x: 0,
          y: 0,
          z: 0
        },
        acc: {
          x: 0,
          y: 0,
          z: 0
        },
        mag: {
          x: 0,
          y: 0,
          z: 0
        }
      }
    };
  }

  handleClick = event => {
    // This prevents ghost click.
    event.preventDefault();
    this.setState({
      open: true,
      anchorEl: event.currentTarget
    });
    FCConnector.startTelemetry();
  };

  handleClose = () => {
    this.setState({
      open: false
    });
    FCConnector.stopTelemetry();
  };
  render() {
    return (
      <div style={{ margin: "0 10px" }}>
        <Button onClick={this.handleClick} color="primary" variant="raised">
          Telemetry
        </Button>
        <Popover
          open={this.state.open}
          anchorEl={this.state.anchorEl}
          anchorOrigin={{ horizontal: "left", vertical: "bottom" }}
          onClose={this.handleClose}
        >
          <List>
            <MenuItem>{"Gyro Roll: " + this.state.telemetry.gyro.x}</MenuItem>
            <MenuItem>{"Gyro Pitch: " + this.state.telemetry.gyro.y}</MenuItem>
            <MenuItem>{"Gyro Yaw: " + this.state.telemetry.gyro.z}</MenuItem>
            <MenuItem>{"Acc Roll: " + this.state.telemetry.acc.x}</MenuItem>
            <MenuItem>{"Acc Pitch: " + this.state.telemetry.acc.y}</MenuItem>
            <MenuItem>{"Acc Yaw: " + this.state.telemetry.acc.z}</MenuItem>
          </List>
        </Popover>
      </div>
    );
  }
}

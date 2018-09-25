import React, { Component } from "react";
import Popover from "@material-ui/core/Popover";
import MenuItem from "@material-ui/core/MenuItem";
import Menu from "@material-ui/core/Menu";
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
    FCConnector.webSockets.send("startTelemetry");
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
  };

  handleRequestClose = () => {
    clearInterval(this.interval);
    this.setState({
      open: false
    });
  };
  render() {
    return (
      <div style={{ margin: "0 10px" }}>
        <Button onClick={this.handleClick} color="primary">
          Telemetry
        </Button>
        <Popover
          open={this.state.open}
          anchorEl={this.state.anchorEl}
          anchorOrigin={{ horizontal: "left", vertical: "bottom" }}
          targetOrigin={{ horizontal: "left", vertical: "top" }}
          onRequestClose={this.handleRequestClose}
        >
          <Menu>
            <MenuItem
              primaryText={"Gyro Roll: " + this.state.telemetry.gyro.x}
            />
            <MenuItem
              primaryText={"Gyro Pitch: " + this.state.telemetry.gyro.y}
            />
            <MenuItem
              primaryText={"Gyro Yaw: " + this.state.telemetry.gyro.z}
            />
            <MenuItem primaryText={"Acc Roll: " + this.state.telemetry.acc.x} />
            <MenuItem
              primaryText={"Acc Pitch: " + this.state.telemetry.acc.y}
            />
            <MenuItem primaryText={"Acc Yaw: " + this.state.telemetry.acc.z} />
          </Menu>
        </Popover>
      </div>
    );
  }
}

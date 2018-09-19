import React, { Component } from "react";
import Popover from "material-ui/Popover";
import MenuItem from "material-ui/MenuItem";
import Menu from "material-ui/Menu";
import RaisedButton from "material-ui/RaisedButton";
import FCConnector from "../utilities/FCConnector";

export default class TelemetryView extends Component {
  constructor(props) {
    super(props);
    this.state = {
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
    this.interval = setInterval(() => {
      //msp 102 is telemetry
      FCConnector.sendCommand("msp 102").then(response => {
        response.json().then(buffer => {
          try {
            let data = new DataView(new Uint8Array(buffer).buffer, 42);
            this.setState({
              telemetry: {
                acc: {
                  x: data.getInt16(2, 1) / 512,
                  y: data.getInt16(4, 1) / 512,
                  z: data.getInt16(6, 1) / 512
                },
                gyro: {
                  x: data.getInt16(8, 1) * (4 / 16.4),
                  y: data.getInt16(10, 1) * (4 / 16.4),
                  z: data.getInt16(12, 1) * (4 / 16.4)
                },
                mag: {
                  x: data.getInt16(14, 1) / 1090,
                  y: data.getInt16(16, 1) / 1090,
                  z: data.getInt16(18, 1) / 1090
                }
              }
            });
          } catch (ex) {
            console.warn(ex);
          }
        });

        // this.setState({telemetry: response.json()});
      });
    }, 60);
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
      <div style={{ padding: "0 10px" }}>
        <RaisedButton onClick={this.handleClick} label="Telemetry" />
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

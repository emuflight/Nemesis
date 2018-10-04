import React, { Component } from "react";
import Popover from "@material-ui/core/Popover";
import MenuItem from "@material-ui/core/MenuItem";
import List from "@material-ui/core/List";
import Button from "@material-ui/core/Button";
import FCConnector from "../utilities/FCConnector";
import { FormattedMessage } from "react-intl";

export default class TelemetryView extends Component {
  constructor(props) {
    super(props);

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
  get type() {
    return "gyro";
  }
  handleGyroData = message => {
    try {
      let telemetry = JSON.parse(message.data);
      if (telemetry.type === "gyro") {
        this.setState({ telemetry });
      }
    } catch (ex) {
      console.warn("unable to parse telemetry", ex);
    }
  };

  handleClick = event => {
    FCConnector.webSockets.addEventListener("message", this.handleGyroData);
    event.preventDefault();
    FCConnector.startTelemetry(this.type);
    this.setState({
      open: true,
      anchorEl: event.currentTarget
    });
  };

  handleClose = () => {
    FCConnector.webSockets.removeEventListener("message", this.handleGyroData);
    FCConnector.stopTelemetry();
    this.setState({
      open: false
    });
  };
  render() {
    return (
      <div style={{ margin: "0 10px" }}>
        <Button onClick={this.handleClick} color="primary" variant="raised">
          <FormattedMessage id="common.telemetry" />
        </Button>
        <Popover
          open={this.state.open}
          anchorEl={this.state.anchorEl}
          anchorOrigin={{ horizontal: "left", vertical: "bottom" }}
          onClose={this.handleClose}
        >
          {this.state.telemetry && (
            <List>
              <MenuItem>
                {
                  <FormattedMessage
                    id="telemetry.acc.roll"
                    values={{ value: this.state.telemetry.acc.x }}
                  />
                }
              </MenuItem>
              <MenuItem>
                {
                  <FormattedMessage
                    id="telemetry.acc.pitch"
                    values={{ value: this.state.telemetry.acc.y }}
                  />
                }
              </MenuItem>
              <MenuItem>
                {
                  <FormattedMessage
                    id="telemetry.acc.yaw"
                    values={{ value: this.state.telemetry.acc.z }}
                  />
                }
              </MenuItem>
              <MenuItem>
                {
                  <FormattedMessage
                    id="telemetry.gyro.yaw"
                    values={{ value: this.state.telemetry.gyro.x }}
                  />
                }
              </MenuItem>
              <MenuItem>
                {
                  <FormattedMessage
                    id="telemetry.gyro.yaw"
                    values={{ value: this.state.telemetry.gyro.y }}
                  />
                }
              </MenuItem>
              <MenuItem>
                {
                  <FormattedMessage
                    id="telemetry.gyro.yaw"
                    values={{ value: this.state.telemetry.gyro.z }}
                  />
                }
              </MenuItem>
            </List>
          )}
        </Popover>
      </div>
    );
  }
}

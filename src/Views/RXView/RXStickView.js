import React, { Component } from "react";
import FCConnector from "../../utilities/FCConnector";
import Typography from "@material-ui/core/Typography";

export default class RXStickView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      channels: [],
      rcCommand: [],
      scale: this.props.scale,
      mapping: this.props.channelMap,
      left_raw_x: 0,
      left_raw_y: 0,
      left_rccommand_x: 0,
      left_rccommand_y: 0,
      right_raw_x: 0,
      right_raw_y: 0,
      right_rccommand_x: 0,
      right_rccommand_y: 0
    };
  }
  /*
  //was from old RXTelemView
  normalize(value) {
    return (
      ((value - this.state.scale.min) * 100) /
      (this.state.scale.max - this.state.scale.min)
    );
  }
  */
  map_rx_sticks(x, in_min, in_max, out_min, out_max) {
    return ((x - in_min) * (out_max - out_min)) / (in_max - in_min) + out_min;
  }

  normalizeRaw(value) {
    return this.map_rx_sticks(value, 1000, 2000, -69, 69);
  }

  normalizeRcCommand(value) {
    return this.map_rx_sticks(value, -500, 500, -69, 69);
  }

  normalizeRcCommandThrottle(value) {
    return this.map_rx_sticks(value, 1000, 2000, -69, 69);
  }

  handleRXData = message => {
    try {
      let { rx } = JSON.parse(message.data);
      if (rx) {
        if (rx.channels) {
          this.setState({ channels: rx.channels });
        }
        if (rx.rcCommand) {
          this.setState({ rcCommand: rx.rcCommand });
        }
      }
    } catch (ex) {
      console.warn("unable to parse telemetry", ex);
    }
  };
  componentDidMount() {
    FCConnector.webSockets.addEventListener("message", this.handleRXData);
    FCConnector.startTelemetry("rx");
  }

  componentWillUnmount() {
    FCConnector.webSockets.removeEventListener("message", this.handleRXData);
    FCConnector.stopFastTelemetry();
  }
  render() {
    return (
      <div
        style={{
          width: "350px",
          height: "220px",
          margin: "0 auto",
          position: "relative",
          backgroundImage: `url("assets/rx-sticks.png")`,
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundSize: "contain"
        }}
      >
        <div
          style={{
            width: "15px",
            height: "15px",
            margin: "0 auto",
            left: 86 + this.normalizeRaw(this.state.channels[2]),
            bottom: 98 + this.normalizeRaw(this.state.channels[3]),
            position: "absolute",
            backgroundImage: `url("assets/rx-reticule-raw.png")`,
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            backgroundSize: "contain"
          }}
        />
        <div
          style={{
            width: "15px",
            height: "15px",
            margin: "0 auto",
            position: "absolute",
            left: 245 + this.normalizeRaw(this.state.channels[0]),
            bottom: 98 + this.normalizeRaw(this.state.channels[1]),
            backgroundImage: `url("assets/rx-reticule-raw.png")`,
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            backgroundSize: "contain"
          }}
        />
        <div
          ref="left_rcCommand"
          style={{
            width: "15px",
            height: "15px",
            margin: "0 auto",
            position: "absolute",
            left: 86 + this.normalizeRcCommand(-this.state.rcCommand[2]),
            bottom:
              98 + this.normalizeRcCommandThrottle(this.state.rcCommand[3]),
            backgroundImage: `url("assets/rx-reticule-rccommand.png")`,
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            backgroundSize: "contain"
          }}
        />
        <div
          style={{
            width: "15px",
            height: "15px",
            margin: "0 auto",
            position: "absolute",
            left: 245 + this.normalizeRcCommand(this.state.rcCommand[0]),
            bottom: 98 + this.normalizeRcCommand(this.state.rcCommand[1]),
            backgroundImage: `url("assets/rx-reticule-rccommand.png")`,
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            backgroundSize: "contain"
          }}
        />
        <Typography
          variant="caption"
          style={{
            position: "absolute",
            bottom: "100px",
            left: "-23px"
          }}
        >
          {this.state.channels[2]}
        </Typography>
        <Typography
          variant="caption"
          style={{
            position: "absolute",
            bottom: "-20px",
            left: "80px"
          }}
        >
          {this.state.channels[3]}
        </Typography>
        <Typography
          variant="caption"
          style={{
            position: "absolute",
            bottom: "100px",
            left: "344px"
          }}
        >
          {this.state.channels[0]}
        </Typography>
        <Typography
          variant="caption"
          style={{
            position: "absolute",
            bottom: "-20px",
            left: "243px"
          }}
        >
          {this.state.channels[1]}
        </Typography>
      </div>
    );
  }
}

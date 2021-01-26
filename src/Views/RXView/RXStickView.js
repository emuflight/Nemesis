import React, { Component } from "react";
import List from "@material-ui/core/List";
import FCConnector from "../../utilities/FCConnector";
import LinearProgress from "@material-ui/core/LinearProgress";
import Typography from "@material-ui/core/Typography";
import { FormattedMessage } from "react-intl";

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

  normalize(value) {
    return (
      ((value - this.state.scale.min) * 100) /
      (this.state.scale.max - this.state.scale.min)
    );
  }
  handleRXData = message => {
    try {
      let { rx } = JSON.parse(message.data);
      console.log("test");
      if (rx) {
        this.setState({ channels: rx.channels });
        this.setState({ rcCommand: rx.rcCommand });
        //console.log(rx.rcCommand[2]);
        //this.refs.left_rcCommand.left = 69 + rx.rcCommand[2];
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
          width: "300px",
          height: "200px",
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
            left: 69 + this.state.left_raw_x,
            bottom: 91 + this.state.left_raw_y,
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
            left: 69 + this.state.right_raw_x,
            bottom: 91 + this.state.right_raw_y,
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
            left: 69 + this.state.rcCommand[2],
            bottom: 91 + this.state.left_rccommand_y,
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
            left: this.state.right_rccommand_x,
            bottom: this.state.right_rccommand_y,
            backgroundImage: `url("assets/rx-reticule-rccommand.png")`,
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            backgroundSize: "contain"
          }}
        />
      </div>
    );
  }
}

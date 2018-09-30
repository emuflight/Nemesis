import React, { Component } from "react";
import List from "@material-ui/core/List";
import FCConnector from "../../utilities/FCConnector";
import LinearProgress from "@material-ui/core/LinearProgress";
import Typography from "@material-ui/core/Typography";

const normalise = value => ((value - 0) * 100) / (3000 - 0);
export default class RXTelemView extends Component {
  state = {
    channels: []
  };
  handleRXData = message => {
    try {
      let telemetry = JSON.parse(message.data);
      if (telemetry.type === "rx") {
        this.setState({ channels: telemetry.channels });
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
    FCConnector.stopTelemetry();
  }
  render() {
    return (
      <List>
        {this.state.channels &&
          this.state.channels.map((v, i) => {
            return (
              <div key={i} style={{ position: "relative" }}>
                <Typography
                  variant="caption"
                  style={{
                    position: "absolute",
                    top: 0,
                    right: 0,
                    bottom: 0,
                    left: 0,
                    textAlign: "center"
                  }}
                >
                  {v}
                </Typography>
                <Typography variant="caption">Channel {i + 1}:</Typography>
                <LinearProgress
                  variant="determinate"
                  style={{ height: 20, margin: 10 }}
                  value={normalise(v)}
                />
              </div>
            );
          })}
      </List>
    );
  }
}

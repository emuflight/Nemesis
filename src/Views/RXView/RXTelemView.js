import React, { Component } from "react";
import List from "@material-ui/core/List";
import FCConnector from "../../utilities/FCConnector";
import LinearProgress from "@material-ui/core/LinearProgress";
import Typography from "@material-ui/core/Typography";
import { FormattedMessage } from "react-intl";

export default class RXTelemView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      channels: [],
      scale: this.props.scale
    };
  }

  normalize(value) {
    return (value * 100) / this.state.scale;
  }
  handleRXData = message => {
    try {
      let telemetry = JSON.parse(message.data);
      if (telemetry.type === "rx") {
        console.log(telemetry);
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
          this.state.channels.map((channel, i) => {
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
                  {channel}
                </Typography>
                <Typography variant="caption">
                  <FormattedMessage
                    id="rx.channel.number"
                    values={{ number: i + 1 }}
                  />
                </Typography>
                <LinearProgress
                  variant="determinate"
                  style={{ height: 20, margin: 10 }}
                  value={this.normalize(channel)}
                />
              </div>
            );
          })}
      </List>
    );
  }
}

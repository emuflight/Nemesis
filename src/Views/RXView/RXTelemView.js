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
      scale: this.props.scale,
      mapping: this.props.channelMap
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
      if (rx) {
        this.setState({ channels: rx.channels }); //.slice(4)
      }
    } catch (ex) {
      console.warn("unable to parse telemetry", ex);
    }
  };
  componentDidMount() {
    FCConnector.webSockets.addEventListener("message", this.handleRXData);
    //FCConnector.startTelemetry("rx"); //RxStickView will also be active and has already started telemetry
  }

  componentWillUnmount() {
    FCConnector.webSockets.removeEventListener("message", this.handleRXData);
    FCConnector.stopFastTelemetry();
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
                  {i === 0 && <FormattedMessage id={"rx.channel.A"} />}
                  {i === 1 && <FormattedMessage id={"rx.channel.E"} />}
                  {i === 2 && <FormattedMessage id={"rx.channel.R"} />}
                  {i === 3 && <FormattedMessage id={"rx.channel.T"} />}
                  {i > 3 && (
                    <FormattedMessage
                      id={"rx.channel.aux-label"}
                      values={i > -1 && { number: i }}
                    />
                  )}
                </Typography>
                <LinearProgress
                  variant="determinate"
                  style={{ height: 5, margin: 2 }}
                  value={this.normalize(channel)}
                />
              </div>
            );
          })}
      </List>
    );
  }
}

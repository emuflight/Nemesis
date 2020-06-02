import React, { Component } from "react";
import List from "@material-ui/core/List";
import AuxChannelItemView from "./AuxChannelItemView";
import Paper from "@material-ui/core/Paper";
import FCConnector from "../../utilities/FCConnector";

export default class AuxChannelView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      modes: props.modes,
      channels: new Array(14).fill(undefined).map((k, i) => {
        if (i === 13) {
          return {
            label: "NONE",
            value: -1
          };
        } else {
          return {
            label: `AUX ${i + 1}`,
            value: i
          };
        }
      }),
      scale: {
        min: props.auxScale.min,
        max: props.auxScale.max,
        step: props.auxScale.step
      },
      telemetry: {
        channels: [],
        min: props.auxScale.min,
        max: props.auxScale.max
      }
    };
  }

  handleRXData = message => {
    try {
      let { rx } = JSON.parse(message.data);
      if (rx) {
        this.setState({ telemetry: rx });
      }
    } catch (ex) {
      console.warn("unable to parse telemetry", ex);
    }
  };

  componentDidMount() {
    if (!this.state.modes) {
      FCConnector.getModes().then(modes => {
        this.setState({ modes });
      });
    }
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
        {this.state.modes &&
          this.state.modes.map((mode, i) => {
            return (
              <Paper key={mode.id}>
                <AuxChannelItemView
                  modeDisabled={!this.props.fcConfig.isBxF}
                  telemetry={this.state.telemetry.channels.slice(4)}
                  telemetryMin={this.state.telemetry.min}
                  telemetryMax={this.state.telemetry.max}
                  scale={this.state.scale}
                  channels={this.state.channels}
                  auxModeList={this.props.auxModeList}
                  notifyDirty={this.props.notifyDirty}
                  item={mode}
                />
              </Paper>
            );
          })}
      </List>
    );
  }
}

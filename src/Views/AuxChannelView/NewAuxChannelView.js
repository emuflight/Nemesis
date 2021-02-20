import React, { Component } from "react";
import List from "@material-ui/core/List";
import NewChannelItemView from "./NewChannelItemView";
import Paper from "@material-ui/core/Paper";
import FCConnector from "../../utilities/FCConnector";
import "./NewAuxChannelView.css";

// <AuxChannelView
// fcConfig={mergedProfile}
// auxScale={mergedProfile.rx_scale}
// auxModeList={mergedProfile.aux_channel_modes}
// modes={mergedProfile.modes && mergedProfile.modes.values}
// notifyDirty={(isDirty, item, newValue) =>
//   this.notifyDirty(isDirty, item, newValue)
// }
// />

export default class NewAuxChannelView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      channels: [],
      modes: [],
      modeMappings: []
    };
  }

  handleRXData = message => {
    try {
      let { rx } = JSON.parse(message.data);
      if (rx) {
        this.setState({ channels: rx.channels });
      }
    } catch (ex) {
      console.warn("unable to parse telemetry", ex);
    }
  };

  //function to create map of each mode, and its mapping config
  mapModes = () => {
    let mappedAuxModes = this.props.auxModeList;
    let modes = this.props.modes;
    for (var i = 0; i < modes.length; i++) {
      let mode = modes[i];
      let auxModeID = mode["auxId"] + 1;

      mappedAuxModes[auxModeID]["mappings"] = {
        id: mode["id"],
        channel: mode["channel"],
        range: mode["range"]
      };
    }

    this.setState({ modeMappings: mappedAuxModes });
  };

  componentDidMount() {
    if (!this.state.modes) {
      FCConnector.getModes().then(modes => {
        this.setState({ modes: modes });
      });
    }
    this.mapModes();
    FCConnector.webSockets.addEventListener("message", this.handleRXData);
    //temp disabled for debugging - allows modes in react view to not refresh constantly
    //FCConnector.startTelemetry("rx");
  }

  componentWillUnmount() {
    FCConnector.webSockets.removeEventListener("message", this.handleRXData);
    FCConnector.stopFastTelemetry();
  }

  render() {
    return (
      <Paper>
        <List>
          {this.state.modeMappings &&
            this.state.modeMappings.slice(1).map((auxMode, i) => {
              return (
                <NewChannelItemView
                  auxMode={auxMode}
                  telemetry={this.state.channels.slice(4)}
                  channels={this.state.channels}
                  min={props.auxScale.min}
                  max={props.auxScale.max}
                  step={props.auxScale.step}
                  notifyDirty={this.props.notifyDirty}
                />
              );
            })}
        </List>
      </Paper>
    );
  }
}

import React, { Component } from "react";
import List from "@material-ui/core/List";
import NewModeItemView from "./NewModeItemView";
import Paper from "@material-ui/core/Paper";
import FCConnector from "../../utilities/FCConnector";
import "./NewAuxModeView.css";

// <AuxChannelView
// fcConfig={mergedProfile}
// auxScale={mergedProfile.rx_scale}
// auxModeList={mergedProfile.aux_channel_modes}
// modes={mergedProfile.modes && mergedProfile.modes.values}
// notifyDirty={(isDirty, item, newValue) =>
//   this.notifyDirty(isDirty, item, newValue)
// }
// />

export default class NewAuxModeView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      //channels: [],
      //channels: new Array(14).fill(0),
      channels: new Array(4).fill(undefined).map((k, i) => {
        return {
          label: `AUX ${i + 1}`,
          value: i
        };
      }),
      telemetry: [],
      modeMappings: [],
      modes: []
    };
  }

  handleRXData = message => {
    try {
      let { rx } = JSON.parse(message.data);
      if (rx) {
        //console.log(rx.channels);
        this.setState({ telemetry: rx.channels });
      }
    } catch (ex) {
      console.warn("unable to parse telemetry", ex);
    }
  };

  //******************

  // NOTE: modes in config command output are parsed and modified by index.js:104

  //******************

  //Append each aux range from fcConfig into a the list of modes, so the component layout can be Modes->Mappings
  mapModes = () => {
    let mappedAuxModes = this.props.auxModeList;
    let modes = this.props.modes;

    //create empty array for each mode titled mappings - this holds one element per channel, and range
    for (var i = 0; i < modes.length; i++) {
      let mode = modes[i];
      let auxModeID = mode["auxId"] + 1;
      mappedAuxModes[auxModeID]["mappings"] = [];
    }

    for (var i = 0; i < modes.length; i++) {
      let mode = modes[i];
      let auxModeID = mode["mode"] + 1; //points to which FLIGHT MODE (arm, angle, etc)

      if (mode["range"][0] !== 900 && mode["range"][1] !== 900) {
        // only add mapping if range is not "900", "900". This is how BF ignores multiple mappings to ARM.
        //for each 'aux mode' for that flight mode, add it to mappings
        mappedAuxModes[auxModeID]["mappings"].push({
          key: mode["id"], // use the aux command id as key for react list
          id: mode["id"],
          channel: mode["channel"],
          range: mode["range"]
        });
      }
    }

    this.setState({ modeMappings: mappedAuxModes });
  };

  componentDidMount() {
    FCConnector.getModes().then(modes => {
      this.setState({ modes: modes });
    });
    // if (!this.state.modes) {
    //   FCConnector.getModes().then(modes => {
    //     this.setState({ modes: modes });
    //   });
    // }
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
                <NewModeItemView
                  key={i}
                  auxMode={auxMode}
                  telemetry={this.state.telemetry}
                  channels={this.state.channels}
                  min={this.props.auxScale.min}
                  max={this.props.auxScale.max}
                  step={this.props.auxScale.step}
                  notifyDirty={this.props.notifyDirty}
                />
              );
            })}
        </List>
      </Paper>
    );
  }
}

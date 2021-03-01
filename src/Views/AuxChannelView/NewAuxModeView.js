import React, { Component } from "react";
import List from "@material-ui/core/List";
import NewModeItemView from "./NewModeItemView";
import Paper from "@material-ui/core/Paper";
import FCConnector from "../../utilities/FCConnector";
import "./NewAuxModeView.css";

// for snackbar
import Button from "@material-ui/core/Button";
import Snackbar from "@material-ui/core/Snackbar";
import IconButton from "@material-ui/core/IconButton";
import CloseIcon from "@material-ui/icons/Close";

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
      telemetry: [], //test data would be [1000,2000,1800,1200]
      modeMappings: [],
      modes: [],
      usedModes: [], // keeps track of added modes that have not yet been saved, to consistently give an available aux id or show error if past 20.
      snackBarOpen: false
    };
  }

  handleSnackBarClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }

    this.setState({ snackBarOpen: false });
  };

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

  getAvailableAuxID = () => {
    let modes = this.props.modes; // each aux command
    for (var i = 0; i < modes.length; i++) {
      // see if it is the default mapping
      //if so, break and return id
      let mode = modes[i];
      //console.log("available: ", mode);
      if (
        mode["range"][0] == 900 &&
        mode["range"][1] == 900 &&
        mode["mode"] == 0 &&
        mode["channel"] == 0 &&
        !this.state.usedModes.includes(i)
      ) {
        let usedModes = this.state.usedModes;
        usedModes.push(i);
        this.setState({ usedModes: usedModes });
        return i;
      }
    }
    return -1; // no available aux id found
  };

  removeUsedAuxID = id_was => {
    // when an unconfigured aux mode is removed, remove it from usedModes list to make it available again to getAvailableAuxID
    let usedModes = this.state.usedModes;
    const index = usedModes.indexOf(id_was);
    if (index > -1) {
      usedModes.splice(index, 1);
    }
    this.setState({ usedModes: usedModes });
  };

  openNoAvailableAuxIDError = () => {
    this.setState({ snackBarOpen: true });
  };
  //******************

  // NOTE: modes in config command output are parsed and modified by index.js:104

  //******************

  //Append each aux range from fcConfig into a the list of modes, so the component layout can be Modes->Mappings
  mapModes = () => {
    let modeMappings = this.props.auxModeList;
    let modes = this.props.modes;
    //create empty array for each mode titled mappings - this holds one element per channel, and range
    for (var i = 0; i < modes.length; i++) {
      let mode = modes[i];
      let auxModeID = mode["auxId"] + 1;
      modeMappings[auxModeID]["mappings"] = [];
    }

    for (var i = 0; i < modes.length; i++) {
      let mode = modes[i];
      let auxModeID = mode["mode"] + 1; //points to which FLIGHT MODE (arm, angle, etc)
      if (mode["range"][0] !== 900 || mode["range"][1] !== 900) {
        // only add mapping if range is not "900", "900". This is how BF ignores multiple mappings to ARM.
        //for each 'aux mode' for that flight mode, add it to mappings
        modeMappings[auxModeID]["mappings"].push({
          key: mode["id"], // use the aux command id as key for react list
          id: mode["id"],
          channel: mode["channel"],
          range: mode["range"]
        });
      }
    }

    this.setState({ modeMappings: modeMappings });
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
                  getAvailableAuxID={this.getAvailableAuxID}
                  removeUsedAuxID={this.removeUsedAuxID}
                  openNoAvailableAuxIDError={this.openNoAvailableAuxIDError}
                  notifyDirty={this.props.notifyDirty}
                />
              );
            })}
        </List>
        <div>
          <Snackbar
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "left"
            }}
            open={this.state.snackBarOpen}
            autoHideDuration={6000}
            onClose={this.handleSnackBarClose}
            message="Maximum of 20 available modes reached."
            action={
              <React.Fragment>
                <IconButton
                  size="small"
                  aria-label="close"
                  color="inherit"
                  onClick={this.handleSnackBarClose}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              </React.Fragment>
            }
          />
        </div>
      </Paper>
    );
  }
}

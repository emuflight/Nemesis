import React, { Component } from "react";
import List from "@material-ui/core/List";
import NewModeItemView from "./NewModeItemView";
import Paper from "@material-ui/core/Paper";
import FCConnector from "../../utilities/FCConnector";
import Snackbar from "@material-ui/core/Snackbar";
import IconButton from "@material-ui/core/IconButton";
import CloseIcon from "@material-ui/icons/Close";

import "./NewAuxModeView.css";

export default class NewAuxModeView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      channels: new Array(4).fill(undefined).map((k, i) => {
        return {
          label: `AUX ${i + 1}`,
          value: i
        };
      }),
      telemetry: [], //test data would be [1000,2000,1800,1200]
      modeMappings: [],
      usedModeIDs: [], // keeps track of list of added mode IDs that have not yet been saved, to consistently give an available aux id or show error if past 20.
      snackBarOpen: false
      //updatedModes: this.props.modes // keeps a list of updated aux modes to be eventually saved to CLI upon save. Same format as this.props.modes, like the aux command output.
    };
  }

  handleSnackBarClose = (event, reason) => {
    // for too many aux modes error
    if (reason === "clickaway") {
      return;
    }
    this.setState({ snackBarOpen: false });
  };

  handleRXData = message => {
    try {
      let { rx } = JSON.parse(message.data);
      if (rx) {
        this.setState({ telemetry: rx.channels });
      }
    } catch (ex) {
      console.warn("unable to parse telemetry", ex);
    }
  };

  getAvailableAuxID = () => {
    let modes = this.props.modes; // use updated modes to keep it current, may  not need usedModeIDs list.
    for (var i = 0; i < modes.length; i++) {
      // go through configured aux modes and look for available/default one. if found return index. if none found return -1
      let mode = modes[i];
      if (
        mode["range"][0] === 900 &&
        mode["range"][1] === 900 &&
        mode["mode"] === 0 &&
        mode["channel"] === 0 &&
        !this.state.usedModeIDs.includes(i)
      ) {
        let usedModeIDs = this.state.usedModeIDs;
        usedModeIDs.push(i);
        this.setState({ usedModeIDs: usedModeIDs });
        return i;
      }
    }
    return -1; // no available aux id found
  };

  removeUsedAuxID = id_was => {
    // when an unconfigured aux mode is removed, remove it from usedModeIDs list to make it available again to getAvailableAuxID
    let usedModeIDs = this.state.usedModeIDs;
    const index = usedModeIDs.indexOf(id_was);
    if (index > -1) {
      usedModeIDs.splice(index, 1);
    }
    this.setState({ usedModeIDs: usedModeIDs });
  };

  //note: this is not used unless use_cli_directly is true in ModeItemView.js
  updateMapping = mapping => {
    // takes incoming changes from ModeItemView and applies to list ready to save to CLI.
    this.setState(previousState => {
      const updatedModes = [...previousState.updatedModes];
      updatedModes[mapping.id].auxId = mapping.id;
      updatedModes[mapping.id].channel = mapping.channel;
      updatedModes[mapping.id].id = mapping.id;
      updatedModes[mapping.id].mode = mapping.mode;
      updatedModes[mapping.id].range = mapping.range;

      return { updatedModes };
    });
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

    for (var k = 0; k < modes.length; k++) {
      let mode = modes[k];
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
    console.log("mapModes ran");
    this.setState({ modeMappings: modeMappings }); //save duplicate list called updatedMappings to handle incoming changes, as well as be able to reset unsaved changes later.
  };

  componentDidMount() {
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
                  updateMapping={this.updateMapping} // not used unless use_cli_directly is enabled in ModeItemView.js
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

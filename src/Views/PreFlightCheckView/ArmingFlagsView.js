import React, { Component } from "react";
import FCConnector from "../../utilities/FCConnector";
import { FormattedMessage } from "react-intl";
import Chip from "@material-ui/core/Chip";
import List from "@material-ui/core/List";
import Typography from "@material-ui/core/Typography";

import "./ArmingFlagsView.css";

import {
  Switch,
  ListItem,
  FormControlLabel,
  FormGroup
} from "@material-ui/core";

export default class ArmingFlagsView extends Component {
  constructor(props) {
    super(props);
    let flags = [];
    if (props.rcCalibrated && props.rcCalibrated.current !== "1") {
      flags.push({
        id: "rc_calibrated",
        label: "calibration.rc"
      });
    }
    if (props.boardCalibrated && props.boardCalibrated.current !== "1") {
      flags.push({
        id: "board_calibrated",
        label: "calibration.board"
      });
    }
    if (props.imufVersion === "9999") {
      flags.push({
        id: "imuf_update",
        label: "imuf.needs-update",
        onClick: () => props.goToImuf()
      });
    }
    this.staticFlags = flags;

    this.state = {
      armingFlags: this.staticFlags
    };
  }
  handleStatusMessage = message => {
    try {
      let { armingFlags, type, debug } = JSON.parse(message.data);
      if (type === "status") {
        let armingFlagsList = [];
        for (var x = 0; x < armingFlags.length; x++) {
          armingFlagsList.push({ id: armingFlags[x], label: armingFlags[x] });
        }
        this.setState({
          debug,
          armingFlags: this.staticFlags.concat(armingFlagsList)
        });
      }
    } catch (ex) {
      console.warn("unable to parse telemetry", ex);
    }
  };

  componentDidMount() {
    FCConnector.webSockets.addEventListener(
      "message",
      this.handleStatusMessage
    );
  }

  componentWillUnmount() {
    FCConnector.webSockets.removeEventListener(
      "message",
      this.handleStatusMessage
    );
  }

  render() {
    return (
      <React.Fragment>
        <Typography variant="h5">
          <FormattedMessage id="pfc.armingflags.title" />
        </Typography>
        <List>
          {this.state.armingFlags.map(flag => (
            <Chip
              onClick={flag.onClick}
              key={flag.label}
              style={{ margin: 4 }}
              label={<FormattedMessage id={flag.label} />}
            />
          ))}
        </List>
        <FormGroup component="fieldset">
          {this.state.debug && (
            <FormControlLabel
              control={
                <Switch
                  checked={this.state.showDebug}
                  onChange={(event, showDebug) => {
                    this.setState({ showDebug });
                  }}
                />
              }
              label={<FormattedMessage id="info.show-debug" />}
            />
          )}
          {this.state.showDebug && (
            <List>
              {this.state.debug.map((debugVal, index) => {
                return (
                  <ListItem className="debug-item" key={index}>
                    DEBUG {index}: {debugVal}
                  </ListItem>
                );
              })}
            </List>
          )}
        </FormGroup>
      </React.Fragment>
    );
  }
}

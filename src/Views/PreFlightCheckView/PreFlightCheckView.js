import React, { Component } from "react";
import Paper from "@material-ui/core/Paper";
import Button from "@material-ui/core/Button";
import AttitudeView from "./AttitudeView";
import FCConnector from "../../utilities/FCConnector";
import { FormattedMessage } from "react-intl";

export default class PreFlightCheckView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      calibrating: false
    };
  }

  render() {
    return (
      <Paper>
        <div>
          {this.props.fcConfig.isBxF && (
            <Button
              color="secondary"
              variant="raised"
              disabled={this.state.calibrating}
              onClick={() => {
                this.setState({ calibrating: true });
                FCConnector.sendCommand("msp 205").then(() => {
                  this.setState({ calibrating: false });
                });
              }}
            >
              <FormattedMessage id="accelerometer.calibrate" />
            </Button>
          )}
          <Button
            style={{ marginLeft: 20 }}
            color="secondary"
            variant="raised"
            onClick={() => this.props.openAssistant("GYRO")}
          >
            <FormattedMessage id="assistant.gyro.orientation" />
          </Button>
        </div>
        <AttitudeView />
      </Paper>
    );
  }
}

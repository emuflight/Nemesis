import React, { Component } from "react";
import SafetyView from "../SafetyView/SafetyView";
import CalibrateMotorsSteps from "./CalibrateMotorsSteps";
import { Typography, Button } from "@material-ui/core";
import { FormattedMessage } from "react-intl";

export default class CalibrateMotorsView extends Component {
  render() {
    return (
      <SafetyView>
        <div style={{ display: "flex", flex: 1, flexDirection: "column" }}>
          <div>
            <Typography variant="h5">
              <FormattedMessage id="assistant.motors.calibration" />
            </Typography>
          </div>
          <div style={{ flex: 1, display: "flex" }}>
            <CalibrateMotorsSteps
              fcConfig={this.props.fcConfig}
              onFinish={this.props.onFinish}
              lastChoice={this.props.lastChoice}
            />
          </div>
          <Button variant="contained" onClick={this.props.onFinish}>
            <FormattedMessage id="assistant.motors.skip-calibration" />
          </Button>
        </div>
      </SafetyView>
    );
  }
}

import React, { Component } from "react";
import SafetyView from "../SafetyView/SafetyView";
import CalibrateMotorsSteps from "./CalibrateMotorsSteps";
import { Typography } from "@material-ui/core";
import { FormattedMessage } from "react-intl";

export default class CalibrateMotorsView extends Component {
  render() {
    return (
      <SafetyView>
        <div style={{ display: "flex", flex: 1, flexDirection: "column" }}>
          <div>
            <Typography variant="headline">
              <FormattedMessage id="assistant.motors.calibration" />
            </Typography>
          </div>
          <div style={{ flex: 1, display: "flex" }}>
            <CalibrateMotorsSteps
              onFinish={this.props.onFinish}
              lastChoice={this.props.lastChoice}
            />
          </div>
        </div>
      </SafetyView>
    );
  }
}

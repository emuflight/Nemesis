import React, { Component } from "react";
import Paper from "@material-ui/core/Paper";
import Button from "@material-ui/core/Button";
import Switch from "@material-ui/core/Switch";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import AttitudeView from "./AttitudeView";
import FCConnector from "../../utilities/FCConnector";
import { FormattedMessage } from "react-intl";
import ArmingFlagsView from "./ArmingFlagsView";

export default class PreFlightCheckView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      calibrating: false
    };
  }

  render() {
    return (
      <React.Fragment>
        <Paper>
          <div>
            {this.props.fcConfig.isBxF && (
              <React.Fragment>
                <FormControlLabel
                  control={
                    <Switch
                      id={this.props.fcConfig.acc_hardware.id}
                      checked={
                        this.props.fcConfig.acc_hardware.current !== "NONE"
                      }
                      onChange={(event, isInputChecked) => {
                        FCConnector.stopTelemetry();
                        this.props.fcConfig.acc_hardware.current = isInputChecked
                          ? "AUTO"
                          : "NONE";
                        FCConnector.setValue(
                          "acc_hardware",
                          this.props.fcConfig.acc_hardware.current
                        ).then(() => {
                          this.props.handleSave().then(() => {
                            this.forceUpdate();
                            setTimeout(() => {
                              FCConnector.startTelemetry("attitude");
                            }, 10000);
                          });
                        });
                      }}
                    />
                  }
                  label={
                    <FormattedMessage
                      id="pid.acc.on-off"
                      values={{
                        state:
                          this.props.fcConfig.acc_hardware.current !== "NONE"
                            ? "ON"
                            : "OFF"
                      }}
                    />
                  }
                />
                <Button
                  color="secondary"
                  variant="contained"
                  disabled={this.state.calibrating}
                  onClick={() => {
                    FCConnector.stopTelemetry();
                    this.setState({ calibrating: true });
                    FCConnector.sendCommand("msp 205").then(() => {
                      this.setState({ calibrating: false });
                      FCConnector.startTelemetry("attitude");
                    });
                  }}
                >
                  <FormattedMessage id="accelerometer.calibrate" />
                </Button>
              </React.Fragment>
            )}
            <Button
              style={{ marginLeft: 20 }}
              color="secondary"
              variant="contained"
              onClick={() => this.props.openAssistant("GYRO")}
            >
              <FormattedMessage id="assistant.gyro.orientation" />
            </Button>
            <Button
              style={{ marginLeft: 20 }}
              color="secondary"
              variant="contained"
              onClick={() => this.props.openAssistant("motors")}
            >
              <FormattedMessage id="assistant.motors" />
            </Button>
          </div>
        </Paper>
        <Paper className="flex">
          <AttitudeView
            firmwareName={this.props.fcConfig.version.fw}
            modelUrl={this.props.modelUrl}
          />
          <Paper style={{ flex: 1 }}>
            <ArmingFlagsView
              rcCalibrated={this.props.fcConfig.rc_calibrated}
              boardCalibrated={this.props.fcConfig.board_calibrated}
            />
          </Paper>
        </Paper>
      </React.Fragment>
    );
  }
}

import React, { Component } from "react";
import FCConnector from "../../utilities/FCConnector";
import PickerAssistantView from "./PickerAssistantView";
import { Button, Typography } from "@material-ui/core";
import { FormattedMessage } from "react-intl";

export default class GyroOrientationView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      telemetry: {},
      ready: false,
      completed: false,
      calibratedFlat: false,
      inverted: false,
      checking: false,
      rotation: ""
    };
    this.steps = [
      {
        id: "assistant.gyro.lay-flat",
        options: [
          {
            image: "assets/props.png",
            style: {
              transform: "rotate3d(-4,3,3, 96deg)",
              backgroundSize: "contain",
              border: "outset 10px",
              height: 240
            },
            title: "lay quad flat",
            headline: "Lay your quad flat. Then, click the image."
          }
        ]
      },
      {
        id: "assistant.gyro.on-nose",
        options: [
          {
            image: "assets/props.png",
            style: {
              transform: "rotate3d(2, 0, -3, 180deg)",
              backgroundSize: "contain",
              height: 240
            },
            title: "on-nose",
            headline: "Position your quad as shown. then, click the image."
          }
        ]
      }
    ];
  }
  handleGyroData = message => {
    try {
      let telemetry = JSON.parse(message.data);
      if (telemetry.type === "gyro") {
        this.telemetry = telemetry;
      }
    } catch (ex) {
      console.warn("unable to parse telemetry", ex);
    }
  };

  resetOrientation() {
    return FCConnector.setValue("align_board_roll", "0").then(() => {
      return FCConnector.setValue("align_board_pitch", "0").then(() => {
        return FCConnector.setValue("align_board_yaw", "0").then(() => {
          return FCConnector.setValue("set acc_calibration", "0,0,0").then(
            () => {
              return FCConnector.setValue("acc_hardware", "AUTO").then(() => {
                return this.setOrientation("DEFAULT");
              });
            }
          );
        });
      });
    });
  }
  setOrientation(orientation) {
    return FCConnector.setValue("align_gyro", orientation).then(() => {
      return FCConnector.setValue("align_acc", orientation).then(() => {
        this.props.fcConfig.align_gyro.current = orientation;
        this.props.fcConfig.align_acc.current = orientation;
      });
    });
  }

  startReadings() {
    return new Promise(resolve => {
      FCConnector.startTelemetry("gyro").then(() => {
        this.setState({ checking: true }, () => {
          setTimeout(() => {
            resolve();
          }, 1000);
        });
      });
    });
  }

  checkFlat() {
    this.startReadings().then(() => {
      if (
        Math.abs(this.telemetry.acc.z) >
        Math.abs(this.telemetry.acc.x) + Math.abs(this.telemetry.acc.y)
      ) {
        FCConnector.stopTelemetry();
        if (this.telemetry.acc.z < -0.8) {
          return this.setState({
            inverted: true,
            calibratedFlat: true,
            calibratingAcc: false,
            checking: false
          });
        } else if (this.telemetry.acc.z > 0.8) {
          return this.setState({
            inverted: false,
            calibratedFlat: true,
            calibratingAcc: false,
            checking: false
          });
        }
      }
      this.setState({ error: true, checking: false });
    });
  }

  checkNose() {
    this.startReadings().then(() => {
      FCConnector.stopTelemetry();
      let orientation = "";
      if (this.telemetry.acc.x < -0.9) {
        orientation = this.state.inverted ? "CW180FLIP" : "CW0";
      } else if (this.telemetry.acc.y < -0.9) {
        orientation = this.state.inverted ? "CW90FLIP" : "CW90";
      } else if (this.telemetry.acc.x > 0.9) {
        orientation = this.state.inverted ? "CW0FLIP" : "CW180";
      } else if (this.telemetry.acc.y > 0.9) {
        orientation = this.state.inverted ? "CW270FLIP" : "CW270";
      } else if (this.telemetry.acc.x < -0.6 && this.telemetry.acc.y < -0.6) {
        orientation = this.state.inverted ? "CW315FLIP" : "CW45";
      } else if (this.telemetry.acc.x > 0.6 && this.telemetry.acc.y < -0.6) {
        orientation = this.state.inverted ? "CW225FLIP" : "CW135";
      } else if (this.telemetry.acc.x > 0.6 && this.telemetry.acc.y > 0.6) {
        orientation = this.state.inverted ? "CW135FLIP" : "CW225";
      } else if (this.telemetry.acc.x < -0.6 && this.telemetry.acc.y > 0.6) {
        orientation = this.state.inverted ? "CW45FLIP" : "CW315";
      } else {
        return this.setState({ error: true });
      }
      return this.setOrientation(orientation).then(() => {
        return this.props.handleSave().then(() => {
          this.setState({ completed: true, orientation, checking: false });
        });
      });
    });
  }

  componentDidMount() {
    FCConnector.webSockets.addEventListener("message", this.handleGyroData);
    if (!this.state.calibratedFlat) {
      return this.resetOrientation().then(() => {
        return this.props.handleSave().then(() => {
          setTimeout(() => {
            this.setState({ ready: true });
          }, 5000);
        });
      });
    }
  }

  componentWillUnmount = () => {
    FCConnector.stopTelemetry();
    FCConnector.webSockets.removeEventListener("message", this.handleGyroData);
  };

  render() {
    let step = this.state.calibratedFlat ? this.steps[1] : this.steps[0];
    return (
      <div style={{ display: "flex", flex: 1, flexDirection: "column" }}>
        <div style={{ flex: 1, margin: "0 auto" }}>
          {this.state.ready ? (
            <PickerAssistantView
              disabled={this.state.checking}
              fcConfig={this.props.fcConfig}
              title={step.id}
              style={{ display: "flex" }}
              type={"GYRO"}
              items={step.options}
              onSelect={() =>
                this.state.calibratedFlat ? this.checkNose() : this.checkFlat()
              }
            />
          ) : (
            <Typography variant="headline">
              <FormattedMessage id="assistant.gyro.reset" />
            </Typography>
          )}
          {this.state.checking && (
            <Typography variant="headline">
              <FormattedMessage id="assistant.gyro.checking" />
            </Typography>
          )}
          {this.state.error && (
            <Typography variant="headline">
              <FormattedMessage id="assistant.gyro.unable-to-calibrate" />
            </Typography>
          )}
          {this.state.completed && (
            <div>
              <Typography variant="headline">
                <FormattedMessage
                  id="assistant.gyro.success"
                  values={{ orientation: this.state.orientation }}
                />
              </Typography>
              <Button
                color="secondary"
                variant="raised"
                onClick={() => this.props.onFinish()}
              >
                <FormattedMessage id="common.finished" />
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  }
}

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
        this.setState({ telemetry });
      }
    } catch (ex) {
      console.warn("unable to parse telemetry", ex);
    }
  };

  setOrientation(orientation) {
    return FCConnector.setValue("align_gyro", orientation).then(() => {
      return FCConnector.setValue("align_acc", orientation);
    });
  }

  checkFlat(telemetry) {
    if (!this.state.checking) {
      this.setState({ calibratingAcc: true });
      FCConnector.sendCliCommand("msp 205").then(() => {
        setTimeout(() => {
          if (
            Math.abs(telemetry.acc.z) >
            Math.abs(telemetry.acc.x) + Math.abs(telemetry.acc.y)
          ) {
            if (telemetry.acc.z < -0.8) {
              return this.setState({
                inverted: true,
                calibratedFlat: true,
                calibratingAcc: false
              });
            } else if (telemetry.acc.z > 0.8) {
              return this.setState({
                inverted: false,
                calibratedFlat: true,
                calibratingAcc: false
              });
            }
          }
          this.setState({ error: true });
        }, 5000);
      });
    }
  }

  checkNose(telemetry) {
    let orientation = "";
    if (telemetry.acc.x < -0.9) {
      orientation = this.state.inverted ? "CW180FLIP" : "CW0";
    } else if (telemetry.acc.y < -0.9) {
      orientation = this.state.inverted ? "CW90FLIP" : "CW90";
    } else if (telemetry.acc.x > 0.9) {
      orientation = this.state.inverted ? "CW0FLIP" : "CW180";
    } else if (telemetry.acc.y > 0.9) {
      orientation = this.state.inverted ? "CW270FLIP" : "CW270";
    } else if (telemetry.acc.x < -0.6 && telemetry.acc.y < -0.6) {
      orientation = this.state.inverted ? "CW315FLIP" : "CW45";
    } else if (telemetry.acc.x > 0.6 && telemetry.acc.y < -0.6) {
      orientation = this.state.inverted ? "CW225FLIP" : "CW135";
    } else if (telemetry.acc.x > 0.6 && telemetry.acc.y > 0.6) {
      orientation = this.state.inverted ? "CW135FLIP" : "CW225";
    } else if (telemetry.acc.x < -0.6 && telemetry.acc.y > 0.6) {
      orientation = this.state.inverted ? "CW45FLIP" : "CW315";
    } else {
      return this.setState({ error: true });
    }
    return this.setOrientation(orientation).then(() => {
      return this.props.handleSave().then(() => {
        this.setState({ completed: true, orientation });
      });
    });
  }

  componentDidMount() {
    return this.setOrientation("CW0").then(() => {
      return FCConnector.setValue("acc_hardware", "AUTO").then(() => {
        return this.props.handleSave().then(() => {
          setTimeout(() => {
            FCConnector.webSockets.addEventListener(
              "message",
              this.handleGyroData
            );
            FCConnector.startTelemetry("gyro");
            this.setState({ ready: true });
          }, 5000);
        });
      });
    });
  }

  componentWillUnmount = () => {
    FCConnector.webSockets.removeEventListener("message", this.handleGyroData);
    FCConnector.stopTelemetry();
  };

  render() {
    let step = this.state.calibratedFlat ? this.steps[1] : this.steps[0];
    return (
      <div style={{ display: "flex", flex: 1, flexDirection: "column" }}>
        <div style={{ flex: 1, margin: "0 auto" }}>
          {this.state.ready ? (
            <PickerAssistantView
              fcConfig={this.props.fcConfig}
              title={step.id}
              style={{ display: "flex" }}
              type={"GYRO"}
              items={step.options}
              onSelect={() =>
                this.state.calibratedFlat
                  ? this.checkNose(this.state.telemetry)
                  : this.checkFlat(this.state.telemetry)
              }
            />
          ) : (
            <Typography variant="headline">
              <FormattedMessage id="assistant.gyro.reset" />
            </Typography>
          )}
          {this.state.error && (
            <Typography variant="headline">
              <FormattedMessage id="assistant.gyro.unable-to-calibrate" />
            </Typography>
          )}
          {this.state.calibratingAcc && (
            <Typography variant="headline">
              <FormattedMessage id="assistant.gyro.calibrating-acc" />
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
                <FormattedMessage id="common.save" />
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  }
}

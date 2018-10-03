import React, { Component } from "react";
import FCConnector from "../../utilities/FCConnector";
import PickerAssistantView from "./PickerAssistantView";
import { Button } from "@material-ui/core";
import { FormattedMessage } from "react-intl";

export default class GyroOrientationView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      telemetry: {},
      completed: false,
      calibratedFlat: false,
      inverted: false,
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

  checkFlat(telemetry) {
    if (
      Math.abs(telemetry.acc.z) >
      Math.abs(telemetry.acc.x) + Math.abs(telemetry.acc.y)
    ) {
      // is king
      if (telemetry.acc.z < -0.8) {
        //ACCZ negative
        return this.setState({ inverted: true, calibratedFlat: true });
      } else if (telemetry.acc.z > 0.8) {
        //ACCZ positive
        return this.setState({ inverted: false, calibratedFlat: true });
      }
    }
    this.setState({ failedMessage: "Unable to calibrate flat" });
  }

  checkNose(telemetry) {
    /**
     *  DEFAULT, CW0, CW90, CW180, CW270, CW0FLIP, CW90FLIP, CW180FLIP, CW270FLIP, CW45, CW135, CW225, CW315, CW45FLIP, CW135FLIP, CW225FLIP, CW315FLIP
     */
    let rotation = "";
    if (telemetry.acc.x < -0.9) {
      rotation = this.state.inverted ? "CW180FLIP" : "CW0"; //set proper rotation
    } else if (telemetry.acc.y < -0.9) {
      rotation = this.state.inverted ? "CW90FLIP" : "CW90"; //set proper rotation
    } else if (telemetry.acc.x > 0.9) {
      rotation = this.state.inverted ? "CW0FLIP" : "CW180"; //set proper rotation
    } else if (telemetry.acc.y > 0.9) {
      rotation = this.state.inverted ? "CW270FLIP" : "CW270"; //set proper rotation
    } else if (telemetry.acc.x < -0.6 && telemetry.acc.y < -0.6) {
      rotation = this.state.inverted ? "CW315FLIP" : "CW45"; //set proper rotation
    } else if (telemetry.acc.x > 0.6 && telemetry.acc.y < -0.6) {
      rotation = this.state.inverted ? "CW225FLIP" : "CW135"; //set proper rotation
    } else if (telemetry.acc.x > 0.6 && telemetry.acc.y > 0.6) {
      rotation = this.state.inverted ? "CW135FLIP" : "CW225"; //set proper rotation
    } else if (telemetry.acc.x < -0.6 && telemetry.acc.y > 0.6) {
      rotation = this.state.inverted ? "CW45FLIP" : "CW315"; //set proper rotation
    } else {
      return this.setState({ failedMessage: "Unable to calibrate nose" });
    }
    FCConnector.setValue("align_gyro", rotation).then(() => {
      FCConnector.setValue("align_acc", rotation).then(() => {
        this.setState({ completed: true });
      });
    });
  }

  componentDidMount() {
    FCConnector.webSockets.addEventListener("message", this.handleGyroData);
    FCConnector.startTelemetry("gyro");
  }

  componentWillUnmount = () => {
    FCConnector.webSockets.removeEventListener("message", this.handleGyroData);
    FCConnector.stopTelemetry();
  };

  render() {
    let step = this.state.calibratedFlat ? this.steps[1] : this.steps[0];
    return (
      <div style={{ display: "flex", flex: 1, flexDirection: "column" }}>
        <div>{this.failedMessage}</div>
        <div style={{ flex: 1, margin: "0 auto" }}>
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
        </div>
        <div>
          {this.state.completed && (
            <Button
              color="secondary"
              variant="raised"
              onClick={() => {
                this.props.handleSave.then(() => {
                  this.props.onFinish();
                });
              }}
            >
              <FormattedMessage id="common.save" />
            </Button>
          )}
        </div>
      </div>
    );
  }
}

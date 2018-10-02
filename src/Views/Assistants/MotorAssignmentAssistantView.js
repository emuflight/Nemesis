import React from "react";
import PickerAssistantView from "./PickerAssistantView";
import SafetyView from "../SafetyView/SafetyView";
import MotorItemView from "./MotorItemView";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import FCConnector from "../../utilities/FCConnector";

export default class MotorAssignmentAssistantView extends PickerAssistantView {
  constructor(props) {
    super(props);
    this.state = {
      theme: props.theme,
      steps: [{ id: undefined }],
      currentStep: 0,
      progress: 0
    };
  }

  remapMotor = (to, from) => {
    this.setState({ remapping: true });
    FCConnector.remapMotor(to, from).then(() => {
      this.setState({ remapping: false });
      this.setState({ remapped: true });
    });
  };
  render() {
    return (
      <SafetyView>
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            padding: 30
          }}
        >
          <div style={{ display: "flex" }}>
            <Typography variant="headline">{`Motor mapping`}</Typography>
            <div style={{ flexGrow: 1 }} />
            <Button
              variant="raised"
              color="secondary"
              disabled={!this.state.remapped}
              onClick={() =>
                FCConnector.saveConfig().then(() => {
                  this.setState({ remapped: false });
                  this.props.onFinish();
                })
              }
            >
              Save
            </Button>
          </div>
          <div
            style={{
              padding: 40,
              flex: 1
            }}
          >
            <div
              style={{
                width: 550,
                height: 450,
                margin: "0 auto",
                position: "relative",
                backgroundImage: `url("${this.props.lastChoice.image}")`,
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat"
              }}
            >
              <MotorItemView
                style={{ position: "absolute", bottom: 0, right: 0 }}
                label={"Motor 1"}
                motorIndex={1}
                remapMotor={this.remapMotor}
                spinTest={value => {
                  FCConnector.spinTestMotor(1, value);
                }}
              />

              <MotorItemView
                style={{ position: "absolute", top: 0, right: 0 }}
                label={"Motor 2"}
                motorIndex={2}
                remapMotor={this.remapMotor}
                spinTest={value => {
                  FCConnector.spinTestMotor(2, value);
                }}
              />
              <MotorItemView
                style={{ position: "absolute", bottom: 0, left: 0 }}
                label={"Motor 3"}
                motorIndex={3}
                remapMotor={this.remapMotor}
                spinTest={value => {
                  FCConnector.spinTestMotor(3, value);
                }}
              />
              <MotorItemView
                style={{ position: "absolute", top: 0, left: 0 }}
                label={"Motor 4"}
                motorIndex={4}
                remapMotor={this.remapMotor}
                spinTest={value => {
                  FCConnector.spinTestMotor(4, value);
                }}
              />
            </div>
          </div>
        </div>
      </SafetyView>
    );
  }
}

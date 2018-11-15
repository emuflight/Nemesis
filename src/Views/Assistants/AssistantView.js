import React, { Component } from "react";
import Modal from "@material-ui/core/Modal";
import PickerAssistantView from "./PickerAssistantView";
import MotorAssignmentAssistantView from "./MotorAssignmentAssistantView";
import RxCalibrationView from "./RxCalibrationView";
import CalibrateMotorsView from "./CalibrateMotorsView";
import GyroOrientationView from "./GyroOrientationView";
import FCConnector from "../../utilities/FCConnector";
import Paper from "@material-ui/core/Paper";
import SavingIndicator from "../SavingIndicator";

export default class AssistantView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      theme: props.theme,
      steps: [{ id: undefined }],
      currentStep: 0
    };
  }
  assistantMap = {
    "assistant.motors.mapping": MotorAssignmentAssistantView,
    "assistant.motors.calibration": CalibrateMotorsView,
    "assistant.gyro.orientation": GyroOrientationView,
    "assistant.rx.calibration": RxCalibrationView
  };
  componentDidMount() {
    return FCConnector.getAssistant(this.props.type, this.props.fw).then(
      assistant => {
        this.setState({
          steps: assistant,
          currentStep: 0,
          endStep: assistant.length - 1,
          open: true
        });
      }
    );
  }
  cancel() {
    this.props.onClose();
  }
  handleNext(lastChoice) {
    lastChoice = lastChoice || this.state.lastChoice;
    if (this.state.currentStep >= this.state.endStep) {
      this.props.onClose();
    } else {
      const nextStep = this.state.currentStep + 1;
      const step = this.state.steps[nextStep];
      if (step.id === "assistant.motors.calibration") {
        const config = this.props.fcConfig;
        const motor_pwm_protocol = config.motor_pwm_protocol.current;
        if (
          motor_pwm_protocol === "6" ||
          motor_pwm_protocol === "7" ||
          motor_pwm_protocol.startsWith("DSHOT") ||
          motor_pwm_protocol.startsWith("PROSHOT")
        ) {
          return this.setState({
            lastChoice,
            currentStep: nextStep + 1,
            showPropsWarning: true
          });
        }
      }
      this.setState({ lastChoice, currentStep: nextStep });
    }
  }
  render() {
    const step = this.state.steps[this.state.currentStep];
    if (!step.id) {
      return "";
    }
    const CustomAssistant = this.assistantMap[step.id] || PickerAssistantView;
    return (
      <Modal
        aria-labelledby="simple-modal-title"
        aria-describedby="simple-modal-description"
        open={this.props.open}
        onClose={this.props.onClose}
      >
        <Paper
          className="flex-column-center"
          style={{
            position: "absolute",
            top: 50,
            right: 50,
            bottom: 50,
            left: 50
          }}
        >
          <div style={{ display: "flex", height: 50 }}>
            <div style={{ flexGrow: 1 }} />
            {this.props.rebooting && <SavingIndicator />}
          </div>
          {
            <CustomAssistant
              showPropsWarning={this.state.showPropsWarning}
              rebooting={this.props.rebooting}
              handleSave={this.props.handleSave}
              fcConfig={this.props.fcConfig}
              title={step.id}
              style={{ flex: 1, display: "flex" }}
              type={this.props.type}
              items={step.options}
              lastChoice={this.state.lastChoice}
              onFinish={lastChoice => this.handleNext(lastChoice)}
              onCancel={() => this.cancel()}
            />
          }
        </Paper>
      </Modal>
    );
  }
}

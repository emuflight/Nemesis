import React, { Component } from "react";
import Modal from "@material-ui/core/Modal";
import PickerAssistantView from "./PickerAssistantView";
import MotorAssignmentAssistantView from "./MotorAssignmentAssistantView";
import RxCalibrationView from "./RxCalibrationView";
import CalibrateMotorsView from "./CalibrateMotorsView";
import GyroOrientationView from "./GyroOrientationView";
import FCConnector from "../../utilities/FCConnector";
import Paper from "@material-ui/core/Paper";
import CircularProgress from "@material-ui/core/CircularProgress";
import { FormattedMessage } from "react-intl";
import Typography from "@material-ui/core/Typography";

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
    if (this.state.currentStep >= this.state.endStep) {
      this.props.onClose();
    } else {
      this.setState({ lastChoice, currentStep: this.state.currentStep + 1 });
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
            {this.props.rebooting && (
              <div style={{ display: "flex" }}>
                <CircularProgress
                  className="flex-column-center"
                  style={{
                    margin: 10
                  }}
                  color="secondary"
                  thickness={7}
                />
                <Typography style={{ flexGrow: 1 }}>
                  <FormattedMessage id="common.saving" />
                </Typography>
              </div>
            )}
          </div>
          {
            <CustomAssistant
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

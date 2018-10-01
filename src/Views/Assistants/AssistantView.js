import React, { Component } from "react";
import Modal from "@material-ui/core/Modal";
import PickerAssistantView from "./PickerAssistantView";
import MotorAssignmentAssistantView from "./MotorAssignmentAssistantView";
import FCConnector from "../../utilities/FCConnector";
import Paper from "@material-ui/core/Paper";

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
    "motor assignments": MotorAssignmentAssistantView
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
    const CustomAssistant = this.assistantMap[step.id] || PickerAssistantView;
    return (
      <Modal
        aria-labelledby="simple-modal-title"
        aria-describedby="simple-modal-description"
        open={this.props.open}
        onClose={this.props.onClose}
      >
        <Paper
          theme={this.state.theme}
          elevation={3}
          style={{
            position: "absolute",
            top: 50,
            right: 50,
            bottom: 50,
            left: 50,
            display: "flex",
            justifyItems: "center",
            alignItems: "center"
          }}
        >
          {
            <CustomAssistant
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

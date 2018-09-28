import React, { Component } from "react";
import Modal from "@material-ui/core/Modal";
import PickerAssistantView from "./PickerAssistantView";
import FCConnector from "../../utilities/FCConnector";
import Paper from "@material-ui/core/Paper";
import theme from "../../Themes/Dark";

export default class AssistantView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentStep: { items: [] }
    };
  }
  componentDidMount() {
    return FCConnector.getAssistant(this.props.type).then(assistant => {
      this.setState({
        steps: assistant,
        currentStep: assistant[0],
        open: true
      });
    });
  }
  render() {
    return (
      <Modal
        aria-labelledby="simple-modal-title"
        aria-describedby="simple-modal-description"
        open={this.props.open}
        onClose={this.props.onClose}
      >
        <Paper
          theme={theme}
          elevation={3}
          style={{
            position: "absolute",
            top: 50,
            right: 50,
            bottom: 50,
            left: 50,
            display: "flex"
          }}
        >
          <PickerAssistantView
            title={this.state.currentStep.id}
            style={{ flex: 1, display: "flex" }}
            type={this.props.type}
            items={this.state.currentStep.options}
            onFinish={() => this.setState({ open: false, route: "" })}
          />
        </Paper>
      </Modal>
    );
  }
}

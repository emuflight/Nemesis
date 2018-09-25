import React, { Component } from "react";
import TextField from "@material-ui/core/TextField";
import FCConnector from "../../utilities/FCConnector";

export default class InputView extends Component {
  constructor(props) {
    super(props);
    this.state = props.item;
    this.notifyDirty = props.notifyDirty;
  }

  sanitizeInput = value => {
    if (value > this.props.max) {
      this.setState({ new: this.props.max });
    } else if (value < this.props.min) {
      this.setState({ new: this.props.min });
    } else {
      this.setState({ new: value });
    }
  };

  updateValue() {
    let isDirty =
      this.state.current !== this.state.newValue && !!this.state.current;
    this.notifyDirty(isDirty, this.state, this.state.newValue);
    this.setState({ current: this.state.newValue, isDirty: isDirty });
    FCConnector.setValue(this.state.id, this.state.newValue).then(() => {
      this.setState({ isDirty: false });
    });
  }

  render() {
    return (
      <TextField
        key={this.state.id}
        disabled={this.state.isDirty}
        helperText={this.state.id}
        value={this.state.current}
        onBlur={() => this.updateValue()}
        onChange={(event, newValue) => {
          this.setState({ newValue });
        }}
        type="number"
      />
    );
  }
}

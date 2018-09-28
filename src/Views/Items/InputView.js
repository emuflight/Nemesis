import React, { Component } from "react";
import TextField from "@material-ui/core/TextField";
import FCConnector from "../../utilities/FCConnector";

export default class InputView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      current: props.item.current
    };
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
    let isDirty = this.state.current !== this.props.item.current;
    if (isDirty) {
      this.props.notifyDirty(isDirty, this.state, this.state.current);
      this.setState({ isDirty: true });
      FCConnector.setValue(this.props.item.id, this.state.current).then(() => {
        this.setState({ isDirty: false });
      });
    }
  }

  render() {
    return (
      <TextField
        key={this.props.item.id}
        disabled={this.state.isDirty}
        label={this.props.item.id}
        value={this.state.current}
        onBlur={() => this.updateValue()}
        onChange={event => {
          this.setState({ current: event.target.value });
        }}
        type="number"
      />
    );
  }
}

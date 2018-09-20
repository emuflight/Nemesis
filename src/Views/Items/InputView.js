import React from "react";
import TextField from "material-ui/TextField";
import { ListItem } from "material-ui/List";
import FCConnector from "../../utilities/FCConnector";

export default class InputView extends ListItem {
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
        floatingLabelText={this.state.id}
        defaultValue={this.state.current}
        errorText={this.state.isDirty && "Saving..."}
        errorStyle={{ color: "rgb(0, 188, 212)" }}
        onBlur={() => this.updateValue()}
        onChange={(event, newValue) => {
          this.setState({ newValue });
        }}
        type="number"
      />
    );
  }
}

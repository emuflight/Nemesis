import React, { Component } from "react";
import FCConnector from "../../utilities/FCConnector";
import FormGroup from "@material-ui/core/FormGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Switch from "@material-ui/core/Switch";

export default class FeatureItemView extends Component {
  constructor(props) {
    super(props);
    this.notifyDirty = props.notifyDirty;
    this.state = {
      checked: this.props.item.current
    };
  }
  handleToggle = payload => {
    this.notifyDirty(true, this.props.item, payload);
    this.setState({ checked: payload });
    FCConnector.sendCommand(
      `feature ${payload ? "" : "-"}${this.props.item.id}`
    );
  };
  render() {
    return (
      <FormGroup component="fieldset">
        <FormControlLabel
          control={
            <Switch
              id={this.props.item.id}
              checked={this.state.checked}
              onChange={(event, isInputChecked) => {
                this.handleToggle(isInputChecked);
              }}
            />
          }
          label={this.props.item.id}
        />
      </FormGroup>
    );
  }
}

import React, { Component } from "react";
import FCConnector from "../../utilities/FCConnector";
import Toggle from "material-ui/Toggle";
import { ListItem } from "material-ui";

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
      <ListItem>
        <Toggle
          id={this.props.item.id}
          label={this.props.item.id}
          toggled={this.state.checked}
          className={this.props.item.id}
          onToggle={(event, isInputChecked) => {
            this.handleToggle(isInputChecked);
          }}
        />
      </ListItem>
    );
  }
}

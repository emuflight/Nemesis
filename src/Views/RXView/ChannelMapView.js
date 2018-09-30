import React, { Component } from "react";
import FCConnector from "../../utilities/FCConnector";
import TextField from "@material-ui/core/TextField";
import AccessibleForward from "@material-ui/icons/AccessibleForward";
import { MenuItem } from "@material-ui/core";

export default class ChannelMapView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      mapping: "",
      isDirty: true
    };
  }

  componentDidMount() {
    FCConnector.sendCliCommand("map").then(mapping => {
      mapping = mapping.replace(/map|\s+|#|\n/gim, "");
      this.originalMapping = mapping;
      this.setState({ mapping, isDirty: false });
    });
  }
  handleUpdate() {
    let isDirty = this.originalMapping !== this.state.mapping;
    if (isDirty) {
      this.props.notifyDirty(true, this.state, this.state.mapping);
      this.setState({ isDirty: true });
      FCConnector.sendCliCommand(`map ${this.state.mapping}`).then(res => {
        this.setState({ isDirty: false });
      });
    }
  }
  render() {
    return (
      <MenuItem>
        <TextField
          disabled={this.state.isDirty}
          label="Channel Mapping"
          value={this.state.mapping}
          onBlur={() => this.handleUpdate()}
          onChange={event => {
            this.setState({ mapping: event.target.value });
          }}
        />
        <AccessibleForward onClick={() => this.props.openAssistant("map")} />
      </MenuItem>
    );
  }
}

import React, { Component } from "react";
import FCConnector from "../../utilities/FCConnector";
import TextField from "@material-ui/core/TextField";
import { MenuItem } from "@material-ui/core";

export default class ChannelMapView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      mapping: "",
      isDirty: false
    };
  }

  handleUpdate() {
    let isDirty = this.originalMapping !== this.state.mapping;
    if (isDirty) {
      this.props.notifyDirty(true, this.state, this.state.mapping);
      this.setState({ isDirty: true });
      FCConnector.setChannelMap(this.state.mapping).then(res => {
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
          type="text"
          onChange={event => {
            this.setState({ mapping: event.target.value });
          }}
        />
      </MenuItem>
    );
  }
}

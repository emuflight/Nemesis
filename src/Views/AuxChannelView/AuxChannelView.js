import React, { Component } from "react";
import List from "@material-ui/core/List";
import AuxChannelItemView from "./AuxChannelItemView";
import Paper from "@material-ui/core/Paper";

export default class AuxChannelView extends Component {
  constructor(props) {
    super(props);
    this.notifyDirty = props.notifyDirty;
    this.state = {
      modes: props.modes,
      theme: props.theme
    };
    this.notifyDirty = props.notifyDirty;
  }

  render() {
    return (
      <List>
        {this.state.modes.map(mode => {
          return (
            <Paper
              key={mode.id}
              theme={this.state.theme}
              elevation={3}
              style={{ margin: "10px", padding: "10px" }}
            >
              <AuxChannelItemView notifyDirty={this.notifyDirty} item={mode} />
            </Paper>
          );
        })}
      </List>
    );
  }
}

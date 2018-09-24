import React, { Component } from "react";
import { List } from "material-ui/List";
import AuxChannelItemView from "./AuxChannelItemView";
import Paper from "material-ui/Paper";

export default class AuxChannelView extends Component {
  constructor(props) {
    super(props);
    this.notifyDirty = props.notifyDirty;
    this.state = {
      modes: props.modes
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
              zDepth={3}
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

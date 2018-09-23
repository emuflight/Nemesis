import React, { Component } from "react";
import { List } from "material-ui/List";
import AuxChannelItemView from "./AuxChannelItemView";
import Paper from "material-ui/Paper";

export default class AuxChannelView extends Component {
  constructor(props) {
    super(props);
    this.notifyDirty = props.notifyDirty;
    this.state = {
      modes: props.modes.map((mode, i) => {
        let parts = mode.split("|");

        let id = i,
          auxId = parseInt(parts[0], 10) || i,
          auxMode = parseInt(parts[1], 10),
          channel = parseInt(parts[2], 10),
          start = parseInt(parts[3], 10),
          end = parseInt(parts[4], 10);
        channel =
          auxMode === 0 && channel === 0 && start === 900 && end === 900
            ? -1
            : channel;
        auxMode =
          auxMode === 0 &&
          (channel === 0 || channel === -1) &&
          start === 900 &&
          end === 900
            ? -1
            : auxMode;
        return {
          id: id,
          auxId: auxId,
          mode: auxMode,
          channel: channel,
          range: [start, end]
        };
      })
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

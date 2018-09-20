import React, { Component } from "react";
import { List } from "material-ui/List";
import PortsItemView from "./PortsItemView";
import DropdownView from "../Items/DropdownView";
import Paper from "material-ui/Paper";

export default class PortsView extends Component {
  constructor(props) {
    super(props);
    this.notifyDirty = props.notifyDirty;
    this.state = {
      rxProvider: {
        id: "serialrx_provider",
        current: props.rxProvider.current,
        values: props.rxProvider.values.map(provider => {
          return {
            value: provider,
            label: provider
          };
        })
      },
      ports: props.ports.map(port => {
        let parts = port.split("|");
        return {
          id: parts[0],
          mode: parts[1],
          mspBaud: parts[2],
          gpsBaud: parts[3],
          telemBaud: parts[4],
          bblBaud: parts[5]
        };
      })
    };
  }

  handleDirty = (dirty, stateObj, index, newVal) => {
    let ports = this.state.ports;
    ports[index].mode = newVal;
    this.setState(ports);
    this.notifyDirty(dirty, stateObj, newVal);
  };

  render() {
    return (
      <List>
        {this.state.ports.map((port, i) => {
          return (
            <Paper
              key={port.id}
              zDepth={3}
              style={{ margin: "10px", padding: "10px", display: "flex" }}
            >
              <PortsItemView
                notifyDirty={(dirty, stateObj, newVal) =>
                  this.handleDirty(dirty, stateObj, i, newVal)
                }
                item={port}
              />
              {port.mode === "64" && (
                <DropdownView
                  notifyDirty={this.notifyDirty}
                  item={this.state.rxProvider}
                />
              )}
            </Paper>
          );
        })}
      </List>
    );
  }
}

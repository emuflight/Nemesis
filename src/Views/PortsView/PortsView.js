import React, { Component } from "react";
import { List } from "material-ui/List";
import PortsItemView from "./PortsItemView";
import DropdownView from "../Items/DropdownView";

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
    debugger;
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
            <div key={port.id} style={{ display: "flex" }}>
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
            </div>
          );
        })}
      </List>
    );
  }
}

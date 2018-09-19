import uiPorts from "./ports_modes.json";

import React, { Component } from "react";
import SelectField from "material-ui/SelectField";
import MenuItem from "material-ui/MenuItem";
import FCConnector from "../../utilities/FCConnector";

export default class PortsItemView extends Component {
  constructor(props) {
    super(props);
    this.state = props.item;
    this.notifyDirty = props.notifyDirty;
    this.portModes = uiPorts.modes;
    this.portLabels = uiPorts.ports;
  }
  updateValue(payload) {
    this.notifyDirty(true, this.state, payload);
    FCConnector.sendCommand(
      `serial ${this.state.id} ${payload} ${this.state.mspBaud} ${
        this.state.gpsBaud
      } ${this.state.telemBaud} ${this.state.bblBaud}`
    ).then(() => {
      this.setState({ isDirty: false });
    });
  }
  render() {
    return (
      <div id={this.state.id}>
        <SelectField
          className={this.portLabels[this.state.id]}
          key={this.portLabels[this.state.id]}
          floatingLabelText={this.portLabels[this.state.id]}
          value={this.state.mode}
          disabled={this.state.id === "20" || this.state.isDirty}
          errorText={this.state.isDirty && "Saving..."}
          errorStyle={{ color: "rgb(0, 188, 212)" }}
          onChange={(event, key, payload) => {
            console.log(payload);
            this.setState({ mode: payload, isDirty: true });
            this.updateValue(payload);
          }}
        >
          {this.portModes.map(item => {
            return (
              <MenuItem
                key={item.value}
                primaryText={item.label}
                value={item.value}
              />
            );
          })}
        </SelectField>
      </div>
    );
  }
}

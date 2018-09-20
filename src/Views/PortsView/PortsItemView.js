import uiPorts from "./ports_modes.json";

import React, { Component } from "react";
import SelectField from "material-ui/SelectField";
import MenuItem from "material-ui/MenuItem";
import FCConnector from "../../utilities/FCConnector";

export default class PortsItemView extends Component {
  constructor(props) {
    super(props);
    this.notifyDirty = props.notifyDirty;
    this.portModes = uiPorts.modes;
    this.portLabels = uiPorts.ports;
  }
  updateValue(payload) {
    this.notifyDirty(true, this.props.item, payload);
    FCConnector.sendCommand(
      `serial ${this.props.item.id} ${payload} ${this.props.item.mspBaud} ${
        this.props.item.gpsBaud
      } ${this.props.item.telemBaud} ${this.props.item.bblBaud}`
    ).then(() => {
      this.setState({ isDirty: false });
    });
  }
  render() {
    return (
      <div id={this.props.item.id}>
        <SelectField
          className={this.portLabels[this.props.item.id]}
          key={this.portLabels[this.props.item.id]}
          floatingLabelText={this.portLabels[this.props.item.id]}
          value={this.props.item.mode}
          disabled={this.props.item.id === "20" || this.props.item.isDirty}
          errorText={this.props.item.isDirty && "Saving..."}
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

import uiPorts from "./ports_modes.json";

import React, { Component } from "react";
import FCConnector from "../../utilities/FCConnector";
import HelperSelect from "../Items/HelperSelect";

export default class PortsItemView extends Component {
  constructor(props) {
    super(props);
    this.portModes = uiPorts.modes;
    this.portLabels = uiPorts.ports;
  }
  updateValue(payload) {
    this.props.notifyDirty(true, this.props.item, payload);
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
      <HelperSelect
        key={this.portLabels[this.props.item.id]}
        name={"mode " + this.props.item.id}
        label={this.portLabels[this.props.item.id]}
        value={this.props.item.mode}
        onChange={(event, key, payload) => {
          console.log(payload);
          this.setState({ mode: payload, isDirty: true });
          this.updateValue(payload);
        }}
        disabled={this.props.item.id === "20" || this.props.item.isDirty}
        items={this.portModes}
      />
    );
  }
}

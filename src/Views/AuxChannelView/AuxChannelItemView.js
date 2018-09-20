import auxModeList from "./aux_mode_list.json";

import React, { Component } from "react";
import SelectField from "material-ui/SelectField";
import { Slider } from "material-ui-slider";
import MenuItem from "material-ui/MenuItem";
import FCConnector from "../../utilities/FCConnector";

export default class AuxChannelItemView extends Component {
  constructor(props) {
    super(props);
    this.notifyDirty = props.notifyDirty;
    this.auxModes = auxModeList;
  }
  updateValue() {
    FCConnector.sendCommand(
      `aux ${this.props.item.id} ${this.props.item.mode} ${
        this.props.item.auxId
      } ${this.props.item.range[0]} ${this.props.item.range[1]} 0`
    ).then(() => {
      this.setState({ isDirty: false });
    });
  }
  render() {
    return (
      <div id={this.props.item.id}>
        <SelectField
          className={"aux" + this.props.item.id}
          key={this.props.item.id}
          floatingLabelText={"aux channel " + (this.props.item.auxId + 1)}
          value={this.props.item.mode}
          disabled={this.props.item.isDirty}
          errorText={this.props.item.isDirty && "Saving..."}
          errorStyle={{ color: "rgb(0, 188, 212)" }}
          onChange={(event, key, payload) => {
            this.setState({ mode: payload, isDirty: true });
            this.updateValue();
          }}
        >
          {this.auxModes.map(item => {
            return (
              <MenuItem
                key={item.value}
                primaryText={item.label}
                value={item.value}
              />
            );
          })}
        </SelectField>
        <div style={{ display: "flex" }}>
          <span style={{ margin: "20px", fontFamily: "inherit" }}>900</span>
          <Slider
            style={{ flex: "1" }}
            className={"aux" + this.props.item.id}
            value={this.props.item.range}
            disabled={!!this.props.item.isDirty}
            min={900}
            max={2100}
            scaleLength={100}
            range={true}
            onChange={range => {
              this.setState({ range });
            }}
            onChangeComplete={() => {
              this.updateValue();
            }}
          />
          <span style={{ margin: "20px" }}>2100</span>
        </div>
      </div>
    );
  }
}

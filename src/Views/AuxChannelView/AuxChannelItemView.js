import auxModeList from "./aux_mode_list.json";

import React, { Component } from "react";
import SelectField from "material-ui/SelectField";
import { Slider } from "material-ui-slider";
import MenuItem from "material-ui/MenuItem";
import FCConnector from "../../utilities/FCConnector";

export default class AuxChannelItemView extends Component {
  constructor(props) {
    super(props);
    this.state = props.item;
    this.notifyDirty = props.notifyDirty;
    this.auxModes = auxModeList;
  }
  updateValue() {
    console.log(this.state);
    FCConnector.sendCommand(
      `aux ${this.state.id} ${this.state.mode} ${this.state.auxId} ${
        this.state.range[0]
      } ${this.state.range[1]} 0`
    ).then(() => {
      this.setState({ isDirty: false });
    });
  }
  render() {
    return (
      <div id={this.state.id}>
        <SelectField
          className={"aux" + this.state.id}
          key={this.state.id}
          floatingLabelText={"aux channel " + (this.state.auxId + 1)}
          value={this.state.mode}
          disabled={this.state.isDirty}
          errorText={this.state.isDirty && "Saving..."}
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
            className={"aux" + this.state.id}
            value={this.state.range}
            disabled={!!this.state.isDirty}
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

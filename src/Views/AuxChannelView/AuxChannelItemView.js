import auxModeList from "./aux_mode_list.json";

import React, { Component } from "react";
import SelectField from "material-ui/SelectField";
import { Slider } from "material-ui-slider";
import MenuItem from "material-ui/MenuItem";
import FCConnector from "../../utilities/FCConnector";
import RaisedButton from "material-ui/RaisedButton";

export default class AuxChannelItemView extends Component {
  constructor(props) {
    super(props);
    this.state = props.item;
    this.notifyDirty = props.notifyDirty;
    this.modes = auxModeList;
    this.channels = new Array(13).fill(undefined).map((k, i) => {
      if (!i) {
        return {
          label: "NONE",
          value: 0
        };
      } else {
        return {
          label: `AUX ${i}`,
          value: i
        };
      }
    });
  }
  get command() {
    return `aux ${this.state.id} ${this.state.mode} ${this.state.channel} ${
      this.state.range[0]
    } ${this.state.range[1]} 0`;
  }
  updateValue() {
    this.setState({ isDirty: true });

    FCConnector.sendCommand(this.command).then(() => {
      this.setState({ isDirty: false });
    });
  }
  render() {
    return (
      <div style={{ display: "flex", flexDirection: "column" }}>
        <div>
          <strong>{"Aux Id: " + (this.state.id + 1)}</strong>
        </div>
        <div style={{ display: "flex" }}>
          <SelectField
            name={"mode" + this.state.id}
            floatingLabelText={"Mode"}
            value={this.state.mode}
            onChange={(event, key, payload) => {
              this.setState({ mode: payload, isDirty: true });
            }}
          >
            {this.modes.map(item => {
              return (
                <MenuItem
                  key={item.value}
                  primaryText={item.label}
                  value={item.value}
                />
              );
            })}
          </SelectField>
          <SelectField
            name={"aux" + this.state.id}
            floatingLabelText={"Aux Channel"}
            value={this.state.channel}
            onChange={(event, key, payload) => {
              this.setState({ channel: payload, isDirty: true });
            }}
          >
            {this.channels.map(item => {
              return (
                <MenuItem
                  key={item.value}
                  primaryText={item.label}
                  value={item.value}
                />
              );
            })}
          </SelectField>
          {this.state.isDirty && (
            <div
              style={{
                display: "flex",
                flex: "1",
                flexDirection: "row-reverse"
              }}
            >
              <RaisedButton
                name="aux_save"
                primary={true}
                onClick={() => this.updateValue()}
                label="Save Mode"
              />
            </div>
          )}
        </div>
        <div style={{ display: "flex" }}>
          <span style={{ margin: "20px", fontFamily: "inherit" }}>900</span>
          <Slider
            style={{ flex: "1" }}
            className={"aux" + this.state.id}
            value={this.state.range}
            min={900}
            max={2100}
            scaleLength={100}
            range={true}
            onChange={range => {
              this.setState({ range, isDirty: true });
            }}
          />
          <span style={{ margin: "20px" }}>2100</span>
        </div>
      </div>
    );
  }
}

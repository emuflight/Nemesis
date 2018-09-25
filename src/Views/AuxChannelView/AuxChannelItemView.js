import auxModeList from "./aux_mode_list.json";

import React, { Component } from "react";
import { Slider } from "material-ui-slider";
import HelperSelect from "../Items/HelperSelect";
import FCConnector from "../../utilities/FCConnector";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";

export default class AuxChannelItemView extends Component {
  constructor(props) {
    super(props);
    this.state = props.item;
    this.notifyDirty = props.notifyDirty;
    this.modes = auxModeList;
    this.channels = new Array(14).fill(undefined).map((k, i) => {
      if (i === 13) {
        return {
          label: "NONE",
          value: -1
        };
      } else {
        return {
          label: `AUX ${i + 1}`,
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
        <Typography>
          <strong>{"Aux Id: " + (this.state.id + 1)}</strong>
        </Typography>
        <div style={{ display: "flex" }}>
          <HelperSelect
            name={"mode " + this.state.id}
            label={"Mode"}
            value={this.state.mode}
            onChange={(event, key, payload) => {
              this.setState({ mode: payload, isDirty: true });
            }}
            items={this.modes}
          />
          <HelperSelect
            name={"aux " + this.state.id}
            label={"Aux Channel"}
            value={this.state.channel}
            onChange={(event, key, payload) => {
              this.setState({ channel: payload, isDirty: true });
            }}
            items={this.channels}
          />
          {this.state.isDirty && (
            <div
              style={{
                display: "flex",
                flex: "1",
                flexDirection: "row-reverse"
              }}
            >
              <Button
                name="aux_save"
                onClick={() => this.updateValue()}
                color="primary"
              >
                Save Mode
              </Button>
            </div>
          )}
        </div>
        <div style={{ display: "flex" }}>
          <Typography style={{ margin: "20px", fontFamily: "inherit" }}>
            900
          </Typography>
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
          <Typography style={{ margin: "20px" }}>2100</Typography>
        </div>
      </div>
    );
  }
}

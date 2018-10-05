import React from "react";
import InputView from "../Items/InputView";
import DropdownView from "../Items/DropdownView";
import ConfigListView from "../ConfigListView/ConfigListView";
import Paper from "@material-ui/core/Paper";
import { AreaChart } from "react-easy-chart";
import biquad from "./biquad";

export default class FiltersView extends ConfigListView {
  render() {
    let bqData;
    let bqColors;
    let freq =
      32000 / parseInt(this.props.fcConfig.gyro_sync_denom.current, 10);
    if (this.props.fcConfig.imuf) {
      freq = 32000;
      bqColors = ["white", "blue", "green"];
      bqData = [
        biquad(
          "lowpass",
          parseInt(this.props.fcConfig.imuf_roll_lpf_cutoff_hz.current, 10),
          freq
        ).plot,
        biquad(
          "lowpass",
          parseInt(this.props.fcConfig.imuf_pitch_lpf_cutoff_hz.current, 10),
          freq
        ).plot,
        biquad(
          "lowpass",
          parseInt(this.props.fcConfig.imuf_yaw_lpf_cutoff_hz.current, 10),
          freq
        ).plot
      ];
    } else {
      bqColors = ["yellow", "red"];
      bqData = [
        biquad(
          "lowpass",
          parseInt(this.props.fcConfig.gyro_lowpass_hz.current, 10),
          freq
        )
      ];
    }
    return (
      <div style={{ display: "flex", flexDirection: "column" }}>
        {this.props.fcConfig.imuf ? (
          <div style={{ flex: 1 }}>
            <Paper
              theme={this.state.theme}
              elevation={3}
              style={{ margin: "10px", padding: "10px" }}
            >
              <InputView
                notifyDirty={this.props.notifyDirty}
                item={this.props.fcConfig.imuf_roll_q}
              />
              <InputView
                notifyDirty={this.props.notifyDirty}
                item={this.props.fcConfig.imuf_pitch_q}
              />
              <InputView
                notifyDirty={this.props.notifyDirty}
                item={this.props.fcConfig.imuf_yaw_q}
              />
            </Paper>
            <Paper
              theme={this.state.theme}
              elevation={3}
              style={{ margin: "10px", padding: "10px", display: "flex" }}
            >
              <div style={{ display: "flex", flexDirection: "column" }}>
                <InputView
                  notifyDirty={(isDirty, state, val) => {
                    this.props.fcConfig.imuf_roll_lpf_cutoff_hz.current = val;
                    this.forceUpdate();
                    this.props.notifyDirty(isDirty, state, val);
                  }}
                  item={this.props.fcConfig.imuf_roll_lpf_cutoff_hz}
                />
                <InputView
                  notifyDirty={(isDirty, state, val) => {
                    this.props.fcConfig.imuf_pitch_lpf_cutoff_hz.current = val;
                    this.forceUpdate();
                    this.props.notifyDirty(isDirty, state, val);
                  }}
                  item={this.props.fcConfig.imuf_pitch_lpf_cutoff_hz}
                />
                <InputView
                  notifyDirty={(isDirty, state, val) => {
                    this.props.fcConfig.imuf_yaw_lpf_cutoff_hz.current = val;
                    this.forceUpdate();
                    this.props.notifyDirty(isDirty, state, val);
                  }}
                  item={this.props.fcConfig.imuf_yaw_lpf_cutoff_hz}
                />
              </div>

              <div>
                <AreaChart
                  data={bqData}
                  areaColors={bqColors}
                  yDomainRange={[-120, 30]}
                  xDomainRange={[0, 500]}
                  axisLabels={{ x: "Hz", y: "Attenuation" }}
                  axes
                  width={450}
                  height={350}
                />
              </div>
            </Paper>
            <Paper
              theme={this.state.theme}
              elevation={3}
              style={{ margin: "10px", padding: "10px" }}
            >
              <InputView
                notifyDirty={this.props.notifyDirty}
                item={this.props.fcConfig.imuf_w}
              />
            </Paper>
          </div>
        ) : (
          <div style={{ flex: 1 }}>
            <Paper
              theme={this.state.theme}
              elevation={3}
              style={{ margin: "10px", padding: "10px", display: "flex" }}
            >
              <div style={{ display: "flex", flexDirection: "column" }}>
                <DropdownView
                  notifyDirty={this.props.notifyDirty}
                  item={this.props.fcConfig.gyro_hardware_lpf}
                />
                <DropdownView
                  notifyDirty={this.props.notifyDirty}
                  item={this.props.fcConfig.gyro_lowpass_type}
                />
                <InputView
                  notifyDirty={this.props.notifyDirty}
                  item={this.props.fcConfig.gyro_lowpass_hz}
                />
              </div>
              <div>
                <AreaChart
                  data={bqData}
                  areaColors={bqColors}
                  yDomainRange={[-120, 30]}
                  xDomainRange={[0, 500]}
                  axesLabels={{ x: "Hz", y: "Attenuation" }}
                  axes
                  width={350}
                  height={250}
                />
              </div>
            </Paper>
            <Paper
              theme={this.state.theme}
              elevation={3}
              style={{ margin: "10px", padding: "10px" }}
            >
              <InputView
                notifyDirty={this.props.notifyDirty}
                item={this.props.fcConfig.gyro_notch1_hz}
              />
              <InputView
                notifyDirty={this.props.notifyDirty}
                item={this.props.fcConfig.gyro_notch1_cutoff}
              />
            </Paper>
            <Paper
              theme={this.state.theme}
              elevation={3}
              style={{ margin: "10px", padding: "10px" }}
            >
              <InputView
                notifyDirty={this.props.notifyDirty}
                item={this.props.fcConfig.gyro_notch2_hz}
              />
              <InputView
                notifyDirty={this.props.notifyDirty}
                item={this.props.fcConfig.gyro_notch2_cutoff}
              />
            </Paper>
          </div>
        )}
      </div>
    );
  }
}

import React from "react";
import InputView from "../Items/InputView";
import DropdownView from "../Items/DropdownView";
import ConfigListView from "../ConfigListView/ConfigListView";
import Paper from "@material-ui/core/Paper";
import { AreaChart } from "react-easy-chart";
import biquad from "./biquad";

export default class FiltersView extends ConfigListView {
  render() {
    let bqData, notchData;
    let bqColors = ["blue", "white", "green"];
    let notchDomainMax = 500;
    let use32K =
      this.props.fcConfig.version.imuf ||
      (this.props.fcConfig.gyro_use_32khz &&
        this.props.fcConfig.gyro_use_32khz.current === "ON");
    let freq =
      (use32K ? 32000 : 8000) /
      parseInt(this.props.fcConfig.gyro_sync_denom.current, 10);
    if (this.props.fcConfig.imuf) {
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
      let cutoff1 = parseInt(
          this.props.fcConfig.gyro_notch1_cutoff.current,
          10
        ),
        cutoff2 = parseInt(this.props.fcConfig.gyro_notch2_cutoff.current, 10),
        hz1 = parseInt(this.props.fcConfig.gyro_notch1_hz.current, 10),
        hz2 = parseInt(this.props.fcConfig.gyro_notch2_hz.current, 10);
      notchDomainMax = Math.floor(Math.min(cutoff1, cutoff2, hz1, hz2) / 2);
      bqData = [
        biquad(
          "lowpass",
          parseInt(this.props.fcConfig.gyro_lowpass_hz.current, 10),
          freq
        ).plot,
        biquad(
          "lowpass",
          parseInt(this.props.fcConfig.gyro_lowpass2_hz.current, 10),
          freq
        ).plot
      ];
      notchData = [
        biquad("notch", hz1, freq, cutoff1).plot,
        biquad("notch", hz2, freq, cutoff2).plot
      ];
    }
    return (
      <div style={{ display: "flex", flexDirection: "column" }}>
        {this.props.fcConfig.imuf ? (
          <div style={{ flex: 1 }}>
            <Paper theme={this.state.theme} elevation={3}>
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
              style={{ display: "flex" }}
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
            <Paper theme={this.state.theme} elevation={3}>
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
              style={{
                display: "flex",
                justifyItems: "center",
                alignItems: "center"
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyItems: "flex-start",
                  alignItems: "flex-start"
                }}
              >
                <DropdownView
                  notifyDirty={this.props.notifyDirty}
                  item={this.props.fcConfig.gyro_lowpass_type}
                />
                {this.props.fcConfig.gyro_lowpass_type.current !== "KALMAN" && (
                  <InputView
                    notifyDirty={this.props.notifyDirty}
                    item={this.props.fcConfig.gyro_lowpass_hz}
                  />
                )}
                {this.props.fcConfig.gyro_lowpass_type.current === "KALMAN" && (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      justifyItems: "flex-start",
                      alignItems: "flex-start",
                      marginRight: 10
                    }}
                  >
                    <InputView
                      notifyDirty={this.props.notifyDirty}
                      item={this.props.fcConfig.gyro_filter_q}
                    />
                    <InputView
                      notifyDirty={this.props.notifyDirty}
                      item={this.props.fcConfig.gyro_filter_r}
                    />
                  </div>
                )}
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyItems: "flex-start",
                  alignItems: "flex-start"
                }}
              >
                <DropdownView
                  notifyDirty={this.props.notifyDirty}
                  item={this.props.fcConfig.gyro_lowpass2_type}
                />
                <InputView
                  notifyDirty={this.props.notifyDirty}
                  item={this.props.fcConfig.gyro_lowpass2_hz}
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
              style={{
                display: "flex",
                justifyItems: "center",
                alignItems: "center"
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyItems: "flex-start",
                  alignItems: "flex-start"
                }}
              >
                <InputView
                  notifyDirty={this.props.notifyDirty}
                  item={this.props.fcConfig.gyro_notch1_hz}
                />
                <InputView
                  notifyDirty={this.props.notifyDirty}
                  item={this.props.fcConfig.gyro_notch1_cutoff}
                />
                <InputView
                  notifyDirty={this.props.notifyDirty}
                  item={this.props.fcConfig.gyro_notch2_hz}
                />
                <InputView
                  notifyDirty={this.props.notifyDirty}
                  item={this.props.fcConfig.gyro_notch2_cutoff}
                />
              </div>
              <div style={{ padding: 20 }}>
                <AreaChart
                  data={notchData}
                  areaColors={bqColors}
                  yDomainRange={[-60, 10]}
                  xDomainRange={[0, notchDomainMax]}
                  width={350}
                  height={250}
                />
              </div>
            </Paper>
          </div>
        )}
      </div>
    );
  }
}

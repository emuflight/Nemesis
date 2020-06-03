import React, { Component } from "react";
import StatelessInput from "../Items/StatelessInput";
import DropdownView from "../Items/DropdownView";
import FeaturesView from "../FeaturesView/FeaturesView";
import Paper from "@material-ui/core/Paper";
import { AreaChart } from "react-easy-chart";
import biquad from "./biquad";
import "./FiltersView.css";
import StatelessSelect from "../Items/StatelessSelect";

export default class FiltersView extends Component {
  render() {
    let bqData, bqDataImuf;
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
      bqDataImuf = [
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
        ).plot,
        biquad(
          "lowpass",
          parseInt(this.props.fcConfig.imuf_acc_lpf_cutoff_hz.current, 10),
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
      {
        /*notchDomainMax = Math.floor(Math.min(cutoff1, cutoff2, hz1, hz2) / 2); */
      }
      bqData = [
        biquad(
          "lowpass",
          parseInt(this.props.fcConfig.gyro_lowpass_hz_roll.current, 10),
          freq
        ).plot,
        biquad(
          "lowpass",
          parseInt(this.props.fcConfig.gyro_lowpass_hz_pitch.current, 10),
          freq
        ).plot,
        biquad(
          "lowpass",
          parseInt(this.props.fcConfig.gyro_lowpass2_hz_roll.current, 10),
          freq
        ).plot,
        biquad("notch", hz1, freq, cutoff1).plot,
        biquad("notch", hz2, freq, cutoff2).plot
      ];
    }
    return (
      <div className="filters-view">
        {!this.props.fcConfig.imuf && (
          <FeaturesView
            fcConfig={this.props.fcConfig}
            features={this.props.features}
            notifyDirty={this.props.notifyDirty}
          />
        )}
        <div style={{ flex: 1 }}>
          <Paper>
            <StatelessInput
              notifyDirty={this.props.notifyDirty}
              id="imuf_roll_q"
            />
            <StatelessInput
              notifyDirty={this.props.notifyDirty}
              id="imuf_pitch_q"
            />
            <StatelessInput
              notifyDirty={this.props.notifyDirty}
              id="imuf_yaw_q"
            />
            <StatelessInput
              notifyDirty={this.props.notifyDirty}
              id="imuf_sharpness"
            />
            <StatelessInput notifyDirty={this.props.notifyDirty} id="imuf_w" />
          </Paper>
        </div>
        {this.props.fcConfig.imuf ? (
          <div style={{ flex: 1 }}>
            <Paper className="flex">
              <div className="flex-column">
                <StatelessInput
                  id="imuf_roll_lpf_cutoff_hz"
                  notifyDirty={(isDirty, state, val) => {
                    this.props.fcConfig.imuf_roll_lpf_cutoff_hz.current = val;
                    this.forceUpdate();
                    this.props.notifyDirty(isDirty, state, val);
                  }}
                />
                <StatelessInput
                  id="imuf_pitch_lpf_cutoff_hz"
                  notifyDirty={(isDirty, state, val) => {
                    this.props.fcConfig.imuf_pitch_lpf_cutoff_hz.current = val;
                    this.forceUpdate();
                    this.props.notifyDirty(isDirty, state, val);
                  }}
                />
                <StatelessInput
                  id="imuf_yaw_lpf_cutoff_hz"
                  notifyDirty={(isDirty, state, val) => {
                    this.props.fcConfig.imuf_yaw_lpf_cutoff_hz.current = val;
                    this.forceUpdate();
                    this.props.notifyDirty(isDirty, state, val);
                  }}
                />
                <StatelessInput
                  id="imuf_acc_lpf_cutoff_hz"
                  notifyDirty={(isDirty, state, val) => {
                    this.props.fcConfig.imuf_acc_lpf_cutoff_hz.current = val;
                    this.forceUpdate();
                    this.props.notifyDirty(isDirty, state, val);
                  }}
                />
              </div>

              <div className="area-chart-container">
                <AreaChart
                  data={bqDataImuf}
                  areaColors={bqColors}
                  yDomainRange={[-100, 0]}
                  xDomainRange={[0, 500]}
                  axisLabels={{ x: "Frequency", y: "Attenuation" }}
                  axes
                  width={450}
                  height={350}
                />
              </div>
            </Paper>
          </div>
        ) : (
          <div style={{ flex: 1 }}>
            <Paper className="flex-center">
              <div className="flex-column-start">
                <StatelessSelect
                  id="gyro_lowpass_type"
                  notifyDirty={this.props.notifyDirty}
                />
                <StatelessInput
                  id="gyro_lowpass_hz_roll"
                  notifyDirty={this.props.notifyDirty}
                />
                <StatelessInput
                  id="gyro_lowpass_hz_pitch"
                  notifyDirty={this.props.notifyDirty}
                />
                <StatelessInput
                  id="gyro_lowpass_hz_yaw"
                  notifyDirty={this.props.notifyDirty}
                />
              </div>
              <div className="flex-column-start">
                <DropdownView
                  notifyDirty={this.props.notifyDirty}
                  item={this.props.fcConfig.gyro_lowpass2_type}
                />
                <StatelessInput
                  notifyDirty={this.props.notifyDirty}
                  item={this.props.fcConfig.gyro_lowpass2_hz_roll}
                />
                <StatelessInput
                  notifyDirty={this.props.notifyDirty}
                  item={this.props.fcConfig.gyro_lowpass2_hz_pitch}
                />
                <StatelessInput
                  notifyDirty={this.props.notifyDirty}
                  item={this.props.fcConfig.gyro_lowpass2_hz_yaw}
                />
              </div>

              {/* TO-DO: Fix style*/}

              <div className="flex-column-start">
                <StatelessInput
                  notifyDirty={this.props.notifyDirty}
                  item={this.props.fcConfig.gyro_notch1_hz}
                />
                <StatelessInput
                  notifyDirty={this.props.notifyDirty}
                  item={this.props.fcConfig.gyro_notch1_cutoff}
                />
                <StatelessInput
                  notifyDirty={this.props.notifyDirty}
                  item={this.props.fcConfig.gyro_notch2_hz}
                />
                <StatelessInput
                  notifyDirty={this.props.notifyDirty}
                  item={this.props.fcConfig.gyro_notch2_cutoff}
                />
              </div>
            </Paper>
            <Paper className="flex-center">
              <DropdownView
                notifyDirty={this.props.notifyDirty}
                item={this.props.fcConfig.dterm_lowpass_hz_type}
              />
              <StatelessInput
                notifyDirty={this.props.notifyDirty}
                key={this.props.fcConfig.dterm_lowpass_hz_roll.id}
                item={this.props.fcConfig.dterm_lowpass_hz_roll}
              />
              <StatelessInput
                notifyDirty={this.props.notifyDirty}
                key={this.props.fcConfig.dterm_lowpass_hz_pitch.id}
                item={this.props.fcConfig.dterm_lowpass_hz_pitch}
              />
              <StatelessInput
                notifyDirty={this.props.notifyDirty}
                key={this.props.fcConfig.dterm_lowpass_hz_yaw.id}
                item={this.props.fcConfig.dterm_lowpass_hz_yaw}
              />
            </Paper>
            <Paper className="flex-center">
              <div className="area-chart-container">
                <AreaChart
                  data={bqData}
                  areaColors={bqColors}
                  yDomainRange={[-100, 0]}
                  xDomainRange={[0, 500]}
                  axesLabels={{ x: "Frequency", y: "Attenuation" }}
                  axes
                  width={500}
                  height={300}
                />
              </div>
            </Paper>
          </div>
        )}
      </div>
    );
  }
}

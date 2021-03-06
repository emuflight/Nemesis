import React, { Component } from "react";
import StatelessInput from "../Items/StatelessInput";
import DropdownView from "../Items/DropdownView";
import FeaturesView from "../FeaturesView/FeaturesView";
import Paper from "@material-ui/core/Paper";
import { AreaChart } from "react-easy-chart";
import biquad from "./biquad";
import "./FiltersView.css";
import { Typography } from "@material-ui/core";
import { FormattedMessage } from "react-intl";
import StatelessSelect from "../Items/StatelessSelect";

export default class FiltersView extends Component {
  render() {
    let bqData;
    let bqColors = ["blue", "white", "green"];

    let use32K =
      this.props.fcConfig.version.imuf ||
      (this.props.fcConfig.gyro_use_32khz &&
        this.props.fcConfig.gyro_use_32khz.current === "ON");
    let freq = 8000,
      //(use32K ? 32000 : 8000) /
      //parseInt(this.props.fcConfig.gyro_sync_denom.current, 10),
      cutoff1 = parseInt(this.props.fcConfig.gyro_notch1_cutoff.current, 10),
      //cutoff2 = parseInt(this.props.fcConfig.gyro_notch2_cutoff.current, 10),
      hz1 = parseInt(this.props.fcConfig.gyro_notch1_hz.current, 10);
    //hz2 = parseInt(this.props.fcConfig.gyro_notch2_hz.current, 10);

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
        ).plot,
        biquad(
          "lowpass",
          parseInt(this.props.fcConfig.gyro_lowpass_hz.current, 10),
          freq
        ).plot,
        biquad(
          "lowpass",
          parseInt(this.props.fcConfig.gyro_lowpass_hz.current, 10),
          freq
        ).plot,
        biquad(
          "lowpass",
          parseInt(this.props.fcConfig.gyro_lowpass_hz_yaw.current, 10),
          freq
        ).plot,
        biquad("notch", hz1, freq, cutoff1).plot
        //biquad("notch", hz2, freq, cutoff2).plot
      ];
    } else {
      bqData = [
        /*
        biquad(
          "lowpass",
          parseInt(this.props.fcConfig.gyro_lowpass_hz.current, 10),
          freq
        ).plot,
        biquad(
          "lowpass",
          parseInt(this.props.fcConfig.gyro_lowpass2_hz_roll.current, 10),
          freq
        ).plot,
        biquad(
          "lowpass",
          parseInt(this.props.fcConfig.gyro_lowpass2_hz_pitch.current, 10),
          freq
        ).plot,
        biquad(
          "lowpass",
          parseInt(this.props.fcConfig.gyro_lowpass2_hz_yaw.current, 10),
          freq
        ).plot,
        */
        biquad("notch", hz1, freq, cutoff1).plot
        //biquad("notch", hz2, freq, cutoff2).plot
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
            {this.props.fcConfig.imuf_sharpness && (
              <StatelessInput
                notifyDirty={this.props.notifyDirty}
                id="imuf_sharpness"
              />
            )}
            <StatelessInput notifyDirty={this.props.notifyDirty} id="imuf_w" />
          </Paper>
        </div>
        <div style={{ flex: 1 }}>
          <Paper className="flex-center-stretch">
            <div style={{ width: "200px" }} className="flex-column">
              <Paper>
                <StatelessSelect
                  id="gyro_lowpass_type"
                  notifyDirty={this.props.notifyDirty}
                />
              </Paper>
              {this.props.fcConfig.gyro_lowpass_hz_roll && (
                <Paper className="flex-column">
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
                </Paper>
              )}
            </div>
            {this.props.fcConfig.gyro_lowpass2_type && (
              <div style={{ width: "200px" }} className="flex-column">
                <Paper>
                  <StatelessSelect
                    id="gyro_lowpass2_type"
                    notifyDirty={this.props.notifyDirty}
                  />
                </Paper>
                <Paper className="flex-column">
                  <StatelessInput
                    id="gyro_lowpass2_hz_roll"
                    notifyDirty={this.props.notifyDirty}
                  />
                  <StatelessInput
                    id="gyro_lowpass2_hz_pitch"
                    notifyDirty={this.props.notifyDirty}
                  />
                  <StatelessInput
                    id="gyro_lowpass2_hz_yaw"
                    notifyDirty={this.props.notifyDirty}
                  />
                </Paper>
              </div>
            )}
            {this.props.fcConfig.imuf && (
              <Paper className="flex-column-start">
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
              </Paper>
            )}
            <Paper className="flex-column-start">
              <StatelessInput
                notifyDirty={this.props.notifyDirty}
                item={this.props.fcConfig.gyro_notch1_hz}
              />
              <StatelessInput
                notifyDirty={this.props.notifyDirty}
                item={this.props.fcConfig.gyro_notch1_cutoff}
              />
              {this.props.fcConfig.gyro_notch2_hz && (
                <StatelessInput
                  notifyDirty={this.props.notifyDirty}
                  item={this.props.fcConfig.gyro_notch2_hz}
                />
              )}
              {this.props.fcConfig.gyro_notch2_cutoff && (
                <StatelessInput
                  notifyDirty={this.props.notifyDirty}
                  item={this.props.fcConfig.gyro_notch2_cutoff}
                />
              )}
            </Paper>
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
          <div style={{ display: "flex" }}>
            <Paper>
              <Typography variant="h6">
                <FormattedMessage id="dterm_lowpass" />
              </Typography>
              <div
                style={{
                  margin: "0 auto",
                  width: "260px",
                  display: "flex",
                  flex: 1,
                  flexDirection: "column"
                }}
              >
                <Paper>
                  <DropdownView
                    notifyDirty={this.props.notifyDirty}
                    item={this.props.fcConfig.dterm_lowpass_hz_type}
                  />
                </Paper>
                <div
                  style={{ Display: "flex", flex: 1, flexDirection: "column" }}
                >
                  {this.props.fcConfig.dterm_lowpass_hz_roll && (
                    <Paper>
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
                  )}
                  {this.props.fcConfig.dterm_lowpass_hz && (
                    <Paper>
                      <StatelessInput
                        notifyDirty={this.props.notifyDirty}
                        key={this.props.fcConfig.dterm_lowpass_hz.id}
                        item={this.props.fcConfig.dterm_lowpass_hz}
                      />
                    </Paper>
                  )}
                  {this.props.fcConfig.dterm_lowpass2_hz_roll && (
                    <Paper>
                      <StatelessInput
                        notifyDirty={this.props.notifyDirty}
                        key={this.props.fcConfig.dterm_lowpass2_hz_roll.id}
                        item={this.props.fcConfig.dterm_lowpass2_hz_roll}
                      />
                      <StatelessInput
                        notifyDirty={this.props.notifyDirty}
                        key={this.props.fcConfig.dterm_lowpass2_hz_pitch.id}
                        item={this.props.fcConfig.dterm_lowpass2_hz_pitch}
                      />
                      <StatelessInput
                        notifyDirty={this.props.notifyDirty}
                        key={this.props.fcConfig.dterm_lowpass2_hz_yaw.id}
                        item={this.props.fcConfig.dterm_lowpass2_hz_yaw}
                      />
                    </Paper>
                  )}
                  {this.props.fcConfig.dterm_lowpass2_hz && (
                    <Paper>
                      <StatelessInput
                        notifyDirty={this.props.notifyDirty}
                        key={this.props.fcConfig.dterm_lowpass2_hz.id}
                        item={this.props.fcConfig.dterm_lowpass2_hz}
                      />
                    </Paper>
                  )}
                </div>
              </div>
            </Paper>
            {this.props.fcConfig.smart_dterm_smoothing_roll && (
              <Paper className="flex-column-start">
                <Typography variant="h6">
                  <FormattedMessage id="smart_dterm_smoothing" />
                </Typography>
                {this.props.fcConfig.smart_dterm_smoothing_roll && (
                  <StatelessInput
                    id="smart_dterm_smoothing_roll"
                    notifyDirty={this.props.notifyDirty}
                  />
                )}
                {this.props.fcConfig.smart_dterm_smoothing_pitch && (
                  <StatelessInput
                    id="smart_dterm_smoothing_pitch"
                    notifyDirty={this.props.notifyDirty}
                  />
                )}
                {this.props.fcConfig.smart_dterm_smoothing_yaw && (
                  <StatelessInput
                    id="smart_dterm_smoothing_yaw"
                    notifyDirty={this.props.notifyDirty}
                  />
                )}
                <Typography variant="h6">
                  <FormattedMessage id="witchcraft" />
                </Typography>
                <StatelessInput
                  id="witchcraft_roll"
                  notifyDirty={this.props.notifyDirty}
                />
                <StatelessInput
                  id="witchcraft_pitch"
                  notifyDirty={this.props.notifyDirty}
                />
                <StatelessInput
                  id="witchcraft_yaw"
                  notifyDirty={this.props.notifyDirty}
                />
              </Paper>
            )}
          </div>
        </div>
      </div>
    );
  }
}

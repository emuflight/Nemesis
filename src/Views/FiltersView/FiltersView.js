import React from "react";
import InputView from "../Items/InputView";
import DropdownView from "../Items/DropdownView";
import ConfigListView from "../ConfigListView/ConfigListView";
import Paper from "material-ui/Paper";

import { toSimpleConfigObj } from "../../utilities/utils";

export default class FiltersView extends ConfigListView {
  constructor(props) {
    super(props);
    props.fcConfig.gyro_lowpass_hz.id = "gyro_lowpass_hz";
    props.fcConfig.imuf_roll_q.id = "imuf_roll_q";
    props.fcConfig.imuf_pitch_q.id = "imuf_pitch_q";
    props.fcConfig.imuf_yaw_q.id = "imuf_yaw_q";
    props.fcConfig.imuf_roll_lpf_cutoff_hz.id = "imuf_roll_lpf_cutoff_hz";
    props.fcConfig.imuf_pitch_lpf_cutoff_hz.id = "imuf_pitch_lpf_cutoff_hz";
    props.fcConfig.imuf_yaw_lpf_cutoff_hz.id = "imuf_yaw_lpf_cutoff_hz";
    props.fcConfig.imuf_w.id = "imuf_w";
    props.fcConfig.gyro_notch1_hz.id = "gyro_notch1_hz";
    props.fcConfig.gyro_notch1_cutoff.id = "gyro_notch1_cutoff";
    props.fcConfig.gyro_notch2_hz.id = "gyro_notch2_hz";
    props.fcConfig.gyro_notch2_cutoff.id = "gyro_notch2_cutoff";
  }
  render() {
    return (
      <div style={{ display: "flex", flexDirection: "column" }}>
        <Paper zDepth={3} style={{ margin: "10px", padding: "10px" }}>
          <DropdownView
            notifyDirty={this.notifyDirty}
            key={"gyro_lpf"}
            item={toSimpleConfigObj(this.props.fcConfig.gyro_lpf, "gyro_lpf")}
          />
          <DropdownView
            notifyDirty={this.notifyDirty}
            key={"gyro_lowpass_type"}
            item={toSimpleConfigObj(
              this.props.fcConfig.gyro_lowpass_type,
              "gyro_lowpass_type"
            )}
          />
          <InputView
            notifyDirty={this.notifyDirty}
            key={this.props.fcConfig.gyro_lowpass_hz.id}
            item={this.props.fcConfig.gyro_lowpass_hz}
          />
        </Paper>
        {this.props.fcConfig.imuf ? (
          <div>
            <Paper zDepth={3} style={{ margin: "10px", padding: "10px" }}>
              <InputView
                notifyDirty={this.notifyDirty}
                key={this.props.fcConfig.imuf_roll_q.id}
                item={this.props.fcConfig.imuf_roll_q}
              />
              <InputView
                notifyDirty={this.notifyDirty}
                key={this.props.fcConfig.imuf_pitch_q.id}
                item={this.props.fcConfig.imuf_pitch_q}
              />
              <InputView
                notifyDirty={this.notifyDirty}
                key={this.props.fcConfig.imuf_yaw_q.id}
                item={this.props.fcConfig.imuf_yaw_q}
              />
            </Paper>
            <Paper zDepth={3} style={{ margin: "10px", padding: "10px" }}>
              <InputView
                notifyDirty={this.notifyDirty}
                key={this.props.fcConfig.imuf_roll_lpf_cutoff_hz.id}
                item={this.props.fcConfig.imuf_roll_lpf_cutoff_hz}
              />
              <InputView
                notifyDirty={this.notifyDirty}
                key={this.props.fcConfig.imuf_pitch_lpf_cutoff_hz.id}
                item={this.props.fcConfig.imuf_pitch_lpf_cutoff_hz}
              />
              <InputView
                notifyDirty={this.notifyDirty}
                key={this.props.fcConfig.imuf_yaw_lpf_cutoff_hz.id}
                item={this.props.fcConfig.imuf_yaw_lpf_cutoff_hz}
              />
            </Paper>
            <Paper zDepth={3} style={{ margin: "10px", padding: "10px" }}>
              <InputView
                notifyDirty={this.notifyDirty}
                key={this.props.fcConfig.imuf_w.id}
                item={this.props.fcConfig.imuf_w}
              />
            </Paper>
          </div>
        ) : (
          <div>
            <Paper zDepth={3} style={{ margin: "10px", padding: "10px" }}>
              <InputView
                notifyDirty={this.notifyDirty}
                key={this.props.fcConfig.gyro_notch1_hz.id}
                item={this.props.fcConfig.gyro_notch1_hz}
              />
              <InputView
                notifyDirty={this.notifyDirty}
                key={this.props.fcConfig.gyro_notch1_cutoff.id}
                item={this.props.fcConfig.gyro_notch1_cutoff}
              />
            </Paper>
            <Paper zDepth={3} style={{ margin: "10px", padding: "10px" }}>
              <InputView
                notifyDirty={this.notifyDirty}
                key={this.props.fcConfig.gyro_notch2_hz.id}
                item={this.props.fcConfig.gyro_notch2_hz}
              />
              <InputView
                notifyDirty={this.notifyDirty}
                key={this.props.fcConfig.gyro_notch2_cutoff.id}
                item={this.props.fcConfig.gyro_notch2_cutoff}
              />
            </Paper>
          </div>
        )}
      </div>
    );
  }
}

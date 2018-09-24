import React from "react";
import InputView from "../Items/InputView";
import DropdownView from "../Items/DropdownView";
import ConfigListView from "../ConfigListView/ConfigListView";
import Paper from "material-ui/Paper";

export default class FiltersView extends ConfigListView {
  render() {
    return (
      <div style={{ display: "flex", flexDirection: "column" }}>
        <Paper zDepth={3} style={{ margin: "10px", padding: "10px" }}>
          <DropdownView
            notifyDirty={this.notifyDirty}
            item={this.props.fcConfig.gyro_hardware_lpf}
          />
          <DropdownView
            notifyDirty={this.notifyDirty}
            item={this.props.fcConfig.gyro_lowpass_type}
          />
          <InputView
            notifyDirty={this.notifyDirty}
            item={this.props.fcConfig.gyro_lowpass_hz}
          />
        </Paper>
        {this.props.fcConfig.imuf ? (
          <div>
            <Paper zDepth={3} style={{ margin: "10px", padding: "10px" }}>
              <InputView
                notifyDirty={this.notifyDirty}
                item={this.props.fcConfig.imuf_roll_q}
              />
              <InputView
                notifyDirty={this.notifyDirty}
                item={this.props.fcConfig.imuf_pitch_q}
              />
              <InputView
                notifyDirty={this.notifyDirty}
                item={this.props.fcConfig.imuf_yaw_q}
              />
            </Paper>
            <Paper zDepth={3} style={{ margin: "10px", padding: "10px" }}>
              <InputView
                notifyDirty={this.notifyDirty}
                item={this.props.fcConfig.imuf_roll_lpf_cutoff_hz}
              />
              <InputView
                notifyDirty={this.notifyDirty}
                item={this.props.fcConfig.imuf_pitch_lpf_cutoff_hz}
              />
              <InputView
                notifyDirty={this.notifyDirty}
                item={this.props.fcConfig.imuf_yaw_lpf_cutoff_hz}
              />
            </Paper>
            <Paper zDepth={3} style={{ margin: "10px", padding: "10px" }}>
              <InputView
                notifyDirty={this.notifyDirty}
                item={this.props.fcConfig.imuf_w}
              />
            </Paper>
          </div>
        ) : (
          <div>
            <Paper zDepth={3} style={{ margin: "10px", padding: "10px" }}>
              <InputView
                notifyDirty={this.notifyDirty}
                item={this.props.fcConfig.gyro_notch1_hz}
              />
              <InputView
                notifyDirty={this.notifyDirty}
                item={this.props.fcConfig.gyro_notch1_cutoff}
              />
            </Paper>
            <Paper zDepth={3} style={{ margin: "10px", padding: "10px" }}>
              <InputView
                notifyDirty={this.notifyDirty}
                item={this.props.fcConfig.gyro_notch2_hz}
              />
              <InputView
                notifyDirty={this.notifyDirty}
                item={this.props.fcConfig.gyro_notch2_cutoff}
              />
            </Paper>
          </div>
        )}
      </div>
    );
  }
}

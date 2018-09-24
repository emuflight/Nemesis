import React from "react";
import ProfileView from "../ProfileView/ProfileView";
import InputView from "../Items/InputView";
import DropdownView from "../Items/DropdownView";
import Paper from "material-ui/Paper";

export default class RatesView extends ProfileView {
  getContent() {
    return (
      <div style={{ display: "flex", flexDirection: "column" }}>
        <Paper zDepth={3} style={{ margin: "10px", padding: "10px" }}>
          <DropdownView
            notifyDirty={this.notifyDirty}
            item={this.props.fcConfig.rates_type}
          />
        </Paper>
        <Paper zDepth={3} style={{ margin: "10px", padding: "10px" }}>
          <InputView
            notifyDirty={this.notifyDirty}
            item={this.props.fcConfig.roll_rc_rate}
          />
          <InputView
            notifyDirty={this.notifyDirty}
            item={this.props.fcConfig.pitch_rc_rate}
          />
          <InputView
            notifyDirty={this.notifyDirty}
            item={this.props.fcConfig.yaw_rc_rate}
          />
        </Paper>
        <Paper zDepth={3} style={{ margin: "10px", padding: "10px" }}>
          <InputView
            notifyDirty={this.notifyDirty}
            item={this.props.fcConfig.roll_srate}
          />
          <InputView
            notifyDirty={this.notifyDirty}
            item={this.props.fcConfig.pitch_srate}
          />
          <InputView
            notifyDirty={this.notifyDirty}
            item={this.props.fcConfig.yaw_srate}
          />
        </Paper>
        <Paper zDepth={3} style={{ margin: "10px", padding: "10px" }}>
          <InputView
            notifyDirty={this.notifyDirty}
            item={this.props.fcConfig.roll_expo}
          />
          <InputView
            notifyDirty={this.notifyDirty}
            item={this.props.fcConfig.pitch_expo}
          />
          <InputView
            notifyDirty={this.notifyDirty}
            item={this.props.fcConfig.yaw_expo}
          />
        </Paper>
        <Paper zDepth={3} style={{ margin: "10px", padding: "10px" }}>
          <InputView
            notifyDirty={this.notifyDirty}
            item={this.props.fcConfig.thr_expo}
          />
        </Paper>
      </div>
    );
  }
}

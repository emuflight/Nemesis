import React from "react";
import ProfileView from "../ProfileView/ProfileView";
import InputView from "../Items/InputView";
import DropdownView from "../Items/DropdownView";
import { toSimpleConfigObj } from "../../utilities/utils";
import Paper from "material-ui/Paper";

export default class RatesView extends ProfileView {
  constructor(props) {
    super(props);
    props.fcConfig.thr_expo.id = "thr_expo";
    props.fcConfig.roll_rc_rate.id = "roll_rc_rate";
    props.fcConfig.pitch_rc_rate.id = "pitch_rc_rate";
    props.fcConfig.yaw_rc_rate.id = "yaw_rc_rate";
    props.fcConfig.roll_srate.id = "roll_srate";
    props.fcConfig.pitch_srate.id = "pitch_srate";
    props.fcConfig.yaw_srate.id = "yaw_srate";
    props.fcConfig.roll_expo.id = "roll_expo";
    props.fcConfig.pitch_expo.id = "pitch_expo";
    props.fcConfig.yaw_expo.id = "yaw_expo";
  }
  getContent() {
    return (
      <div style={{ display: "flex", flexDirection: "column" }}>
        <Paper zDepth={3} style={{ margin: "10px", padding: "10px" }}>
          <DropdownView
            notifyDirty={this.notifyDirty}
            key={"rates_type"}
            item={toSimpleConfigObj(
              this.props.fcConfig.rates_type,
              "rates_type"
            )}
          />
        </Paper>
        <Paper zDepth={3} style={{ margin: "10px", padding: "10px" }}>
          <InputView
            notifyDirty={this.notifyDirty}
            key={this.props.fcConfig.roll_rc_rate.id}
            item={this.props.fcConfig.roll_rc_rate}
          />
          <InputView
            notifyDirty={this.notifyDirty}
            key={this.props.fcConfig.pitch_rc_rate.id}
            item={this.props.fcConfig.pitch_rc_rate}
          />
          <InputView
            notifyDirty={this.notifyDirty}
            key={this.props.fcConfig.yaw_rc_rate.id}
            item={this.props.fcConfig.yaw_rc_rate}
          />
        </Paper>
        <Paper zDepth={3} style={{ margin: "10px", padding: "10px" }}>
          <InputView
            notifyDirty={this.notifyDirty}
            key={this.props.fcConfig.roll_srate.id}
            item={this.props.fcConfig.roll_srate}
          />
          <InputView
            notifyDirty={this.notifyDirty}
            key={this.props.fcConfig.pitch_srate.id}
            item={this.props.fcConfig.pitch_srate}
          />
          <InputView
            notifyDirty={this.notifyDirty}
            key={this.props.fcConfig.yaw_srate.id}
            item={this.props.fcConfig.yaw_srate}
          />
        </Paper>
        <Paper zDepth={3} style={{ margin: "10px", padding: "10px" }}>
          <InputView
            notifyDirty={this.notifyDirty}
            key={this.props.fcConfig.roll_expo.id}
            item={this.props.fcConfig.roll_expo}
          />
          <InputView
            notifyDirty={this.notifyDirty}
            key={this.props.fcConfig.pitch_expo.id}
            item={this.props.fcConfig.pitch_expo}
          />
          <InputView
            notifyDirty={this.notifyDirty}
            key={this.props.fcConfig.yaw_expo.id}
            item={this.props.fcConfig.yaw_expo}
          />
        </Paper>
        <Paper zDepth={3} style={{ margin: "10px", padding: "10px" }}>
          <InputView
            notifyDirty={this.notifyDirty}
            key={this.props.fcConfig.thr_expo.id}
            item={this.props.fcConfig.thr_expo}
          />
        </Paper>
      </div>
    );
  }
}

import React from "react";
import ProfileView from "../ProfileView/ProfileView";
import ConfigListView from "../ConfigListView/ConfigListView";
import DropdownView from "../Items/DropdownView";
import Paper from "@material-ui/core/Paper";
import "./RatesView.css";
import { Typography, TextField } from "@material-ui/core";
import { FormattedMessage } from "react-intl";
import FloatView from "../Items/FloatView";
import InputView from "../Items/InputView";

export default class RatesView extends ProfileView {
  calcDps(input, rcRate, expo, superRate, deadband) {
    let rcCommand = input - deadband;
    let clamp = (n, minn, maxn) => Math.max(Math.min(maxn, n), minn);

    let absRcCommand = Math.abs(rcCommand);

    if (rcRate > 2.0) {
      rcRate = rcRate + 14.54 * (rcRate - 2.0);
    }

    if (expo !== 0) {
      rcCommand =
        rcCommand * Math.abs(rcCommand) ** 3 * expo + rcCommand * (1.0 - expo);
    }
    let angleRate = 200.0 * rcRate * rcCommand;
    if (superRate !== 0) {
      let rcSuperFactor =
        1.0 / clamp(1.0 - absRcCommand * superRate, 0.01, 1.0);
      angleRate *= rcSuperFactor;
    }
    return angleRate;
  }
  getContent() {
    if (!this.state.isBxF) {
      return (
        <ConfigListView
          notifyDirty={this.props.notifyDirty}
          items={this.props.items}
        />
      );
    }
    return (
      <div style={{ display: "flex", flexDirection: "column" }}>
        <Paper
          theme={this.state.theme}
          elevation={3}
          style={{ margin: "10px", padding: "10px" }}
        >
          <DropdownView
            notifyDirty={this.props.notifyDirty}
            item={this.props.fcConfig.rates_type}
          />
        </Paper>
        <Paper
          theme={this.state.theme}
          elevation={3}
          style={{ margin: "10px", padding: "10px" }}
        >
          <Typography>
            <FormattedMessage id="common.roll" />
          </Typography>
          <FloatView
            notifyDirty={this.props.notifyDirty}
            item={this.props.fcConfig.roll_rc_rate}
          />
          <FloatView
            notifyDirty={this.props.notifyDirty}
            item={this.props.fcConfig.roll_srate}
          />
          <FloatView
            notifyDirty={this.props.notifyDirty}
            item={this.props.fcConfig.roll_expo}
          />
          <TextField
            disabled={true}
            label={<FormattedMessage id="rates.max-dps" />}
            value={Math.ceil(
              this.calcDps(
                1.0,
                parseFloat(this.props.fcConfig.roll_rc_rate.current) / 100,
                parseFloat(this.props.fcConfig.roll_expo.current) / 100,
                parseFloat(this.props.fcConfig.roll_srate.current) / 100,
                parseInt(this.props.fcConfig.deadband.current, 10) / 100
              )
            )}
          />
        </Paper>
        <Paper
          theme={this.state.theme}
          elevation={3}
          style={{ margin: "10px", padding: "10px" }}
        >
          <Typography>
            <FormattedMessage id="common.pitch" />
          </Typography>
          <FloatView
            notifyDirty={this.props.notifyDirty}
            item={this.props.fcConfig.pitch_rc_rate}
          />
          <FloatView
            notifyDirty={this.props.notifyDirty}
            item={this.props.fcConfig.pitch_srate}
          />
          <FloatView
            notifyDirty={this.props.notifyDirty}
            item={this.props.fcConfig.pitch_expo}
          />
          <TextField
            disabled={true}
            label={<FormattedMessage id="rates.max-dps" />}
            value={Math.ceil(
              this.calcDps(
                1.0,
                parseFloat(this.props.fcConfig.pitch_rc_rate.current) / 100,
                parseFloat(this.props.fcConfig.pitch_expo.current) / 100,
                parseFloat(this.props.fcConfig.pitch_srate.current) / 100,
                parseInt(this.props.fcConfig.deadband.current, 10) / 100
              )
            )}
          />
        </Paper>
        <Paper
          theme={this.state.theme}
          elevation={3}
          style={{ margin: "10px", padding: "10px" }}
        >
          <Typography>
            <FormattedMessage id="common.yaw" />
          </Typography>
          <FloatView
            notifyDirty={this.props.notifyDirty}
            item={this.props.fcConfig.yaw_rc_rate}
          />
          <FloatView
            notifyDirty={this.props.notifyDirty}
            item={this.props.fcConfig.yaw_srate}
          />
          <FloatView
            notifyDirty={this.props.notifyDirty}
            item={this.props.fcConfig.yaw_expo}
          />

          <TextField
            disabled={true}
            label={<FormattedMessage id="rates.max-dps" />}
            value={Math.ceil(
              this.calcDps(
                1.0,
                parseFloat(this.props.fcConfig.yaw_rc_rate.current) / 100,
                parseFloat(this.props.fcConfig.yaw_expo.current) / 100,
                parseFloat(this.props.fcConfig.yaw_srate.current) / 100,
                parseInt(this.props.fcConfig.yaw_deadband.current, 10) / 100
              )
            )}
          />
        </Paper>
        <Paper
          theme={this.state.theme}
          elevation={3}
          style={{ margin: "10px", padding: "10px" }}
        >
          <FloatView
            notifyDirty={this.props.notifyDirty}
            item={this.props.fcConfig.thr_expo}
          />
          <InputView
            notifyDirty={this.props.notifyDirty}
            item={this.props.fcConfig.deadband}
          />
          <InputView
            notifyDirty={this.props.notifyDirty}
            item={this.props.fcConfig.yaw_deadband}
          />
        </Paper>
      </div>
    );
  }
}

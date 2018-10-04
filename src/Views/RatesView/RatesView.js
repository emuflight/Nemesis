import React from "react";
import ProfileView from "../ProfileView/ProfileView";
import ConfigListView from "../ConfigListView/ConfigListView";
import InputView from "../Items/InputView";
import DropdownView from "../Items/DropdownView";
import Paper from "@material-ui/core/Paper";
import "./RatesView.css";
import { Typography } from "@material-ui/core";
import { FormattedMessage } from "react-intl";

export default class RatesView extends ProfileView {
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
          <InputView
            notifyDirty={this.props.notifyDirty}
            item={this.props.fcConfig.roll_rc_rate}
          />
          <InputView
            notifyDirty={this.props.notifyDirty}
            item={this.props.fcConfig.roll_srate}
          />
          <InputView
            notifyDirty={this.props.notifyDirty}
            item={this.props.fcConfig.roll_expo}
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
          <InputView
            notifyDirty={this.props.notifyDirty}
            item={this.props.fcConfig.pitch_rc_rate}
          />
          <InputView
            notifyDirty={this.props.notifyDirty}
            item={this.props.fcConfig.pitch_srate}
          />

          <InputView
            notifyDirty={this.props.notifyDirty}
            item={this.props.fcConfig.pitch_expo}
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
          <InputView
            notifyDirty={this.props.notifyDirty}
            item={this.props.fcConfig.yaw_rc_rate}
          />
          <InputView
            notifyDirty={this.props.notifyDirty}
            item={this.props.fcConfig.yaw_srate}
          />
          <InputView
            notifyDirty={this.props.notifyDirty}
            item={this.props.fcConfig.yaw_expo}
          />
        </Paper>
        <Paper
          theme={this.state.theme}
          elevation={3}
          style={{ margin: "10px", padding: "10px" }}
        >
          <InputView
            notifyDirty={this.props.notifyDirty}
            item={this.props.fcConfig.thr_expo}
          />
        </Paper>
      </div>
    );
  }
}

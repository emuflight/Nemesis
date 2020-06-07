import React from "react";
import ProfileView from "../ProfileView/ProfileView";
import DropdownView from "../Items/DropdownView";
import ConfigListView from "../ConfigListView/ConfigListView";
//import TpaCurveView from "../TpaCurveView/TpaCurveView";
import Paper from "@material-ui/core/Paper";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Switch from "@material-ui/core/Switch";
import "./PidView.css";
import FCConnector from "../../utilities/FCConnector";
import { Typography, TextField } from "@material-ui/core";
import { FormattedMessage } from "react-intl";
import PidProcessDenom from "./PidProcessDenom";
import GyroSyncDenom from "./GyroSyncDenom";
import StatelessInput from "../Items/StatelessInput";
//import { FCConfigContext } from "../../App";

export default class PidsView extends ProfileView {
  get children() {
    return (
      <div
        className="pid-view"
        style={{ display: "flex", flexDirection: "column" }}
      >
        {this.state.isBxF && (
          <Paper>
            <div>
              {this.props.fcConfig.gyro_use_32khz && (
                <FormControlLabel
                  control={
                    <Switch
                      id={this.props.fcConfig.gyro_use_32khz.id}
                      checked={
                        this.props.fcConfig.gyro_use_32khz.current === "ON"
                      }
                      onChange={(event, isInputChecked) => {
                        this.props.fcConfig.gyro_use_32khz.current = isInputChecked
                          ? "ON"
                          : "OFF";
                        this.forceUpdate();
                        FCConnector.setValue(
                          "gyro_use_32khz",
                          this.props.fcConfig.gyro_use_32khz.current
                        ).then(() => {
                          this.props.handleSave().then(() => {
                            //this.updatePidValues("1");
                          });
                        });
                      }}
                    />
                  }
                  label={<FormattedMessage id="pid.gyro.use-32k" />}
                />
              )}
              <FormControlLabel
                control={
                  <Switch
                    id={this.props.fcConfig.iterm_rotation.id}
                    checked={
                      this.props.fcConfig.iterm_rotation.current === "ON"
                    }
                    onChange={(event, isInputChecked) => {
                      this.props.fcConfig.iterm_rotation.current = isInputChecked
                        ? "ON"
                        : "OFF";
                      this.forceUpdate();
                      FCConnector.setValue(
                        "iterm_rotation",
                        this.props.fcConfig.iterm_rotation.current
                      ).then(() => {
                        this.props.handleSave().then(() => {
                          //this.updatePidValues("1");
                        });
                      });
                    }}
                  />
                }
                label={<FormattedMessage id="iterm_rotation" />}
              />
              <FormControlLabel
                control={
                  <Switch
                    id={this.props.fcConfig.nfe_racermode.id}
                    checked={this.props.fcConfig.nfe_racermode.current === "ON"}
                    onChange={(event, isInputChecked) => {
                      this.props.fcConfig.nfe_racermode.current = isInputChecked
                        ? "ON"
                        : "OFF";
                      this.forceUpdate();
                      FCConnector.setValue(
                        "nfe_racermode",
                        this.props.fcConfig.nfe_racermode.current
                      ).then(() => {
                        this.props.handleSave().then(() => {
                          //this.updatePidValues("1");
                        });
                      });
                    }}
                  />
                }
                label={<FormattedMessage id="nfe_racermode" />}
              />
              <FormControlLabel
                control={
                  <Switch
                    id={this.props.fcConfig.acc_hardware.id}
                    checked={
                      this.props.fcConfig.acc_hardware.current !== "NONE"
                    }
                    onChange={(event, isInputChecked) => {
                      this.props.fcConfig.acc_hardware.current = isInputChecked
                        ? "AUTO"
                        : "NONE";
                      this.forceUpdate();
                      FCConnector.setValue(
                        "acc_hardware",
                        this.props.fcConfig.acc_hardware.current
                      ).then(() => {
                        this.props.handleSave();
                      });
                    }}
                  />
                }
                label={
                  <FormattedMessage
                    id="pid.acc.on-off"
                    values={{
                      state:
                        this.props.fcConfig.acc_hardware.current !== "NONE"
                          ? "ON"
                          : "OFF"
                    }}
                  />
                }
              />
            </div>
            <GyroSyncDenom
              notifyDirty={this.props.notifyDirty}
              item={this.props.fcConfig.gyro_sync_denom}
            />
            <PidProcessDenom
              notifyDirty={this.props.notifyDirty}
              item={this.props.fcConfig.pid_process_denom}
            />
            {this.props.fcConfig.buttered_pids && (
              <DropdownView
                notifyDirty={this.props.notifyDirty}
                item={this.props.fcConfig.buttered_pids}
              />
            )}
            <DropdownView
              notifyDirty={this.props.notifyDirty}
              item={this.props.fcConfig.motor_pwm_protocol}
            />
          </Paper>
        )}

        <div style={{ display: "flex" }}>
          <Paper>
            <div
              style={{ margin: "0 auto", width: "600px" }}
              className="flex-center-start"
            >
              <Typography variant="h6">
                <FormattedMessage id="PID" />
              </Typography>
              <StatelessInput
                id="p_roll"
                notifyDirty={this.props.notifyDirty}
              />
              <StatelessInput
                id="i_roll"
                notifyDirty={this.props.notifyDirty}
              />
              <StatelessInput
                id="d_roll"
                notifyDirty={this.props.notifyDirty}
              />

              <StatelessInput
                id="p_pitch"
                notifyDirty={this.props.notifyDirty}
              />
              <StatelessInput
                id="i_pitch"
                notifyDirty={this.props.notifyDirty}
              />
              <StatelessInput
                id="d_pitch"
                notifyDirty={this.props.notifyDirty}
              />

              <StatelessInput id="p_yaw" notifyDirty={this.props.notifyDirty} />
              <StatelessInput id="i_yaw" notifyDirty={this.props.notifyDirty} />
              <StatelessInput id="d_yaw" notifyDirty={this.props.notifyDirty} />
            </div>
            <div
              style={{ margin: "0 auto", width: "600px" }}
              className="flex-center-start"
            >
              <Typography variant="h6">
                <FormattedMessage id="SPA" />
              </Typography>
              <StatelessInput
                id="spa_roll_p"
                notifyDirty={this.props.notifyDirty}
              />
              <StatelessInput
                id="spa_roll_i"
                notifyDirty={this.props.notifyDirty}
              />
              <StatelessInput
                id="spa_roll_d"
                notifyDirty={this.props.notifyDirty}
              />
              <StatelessInput
                id="spa_pitch_p"
                notifyDirty={this.props.notifyDirty}
              />
              <StatelessInput
                id="spa_pitch_i"
                notifyDirty={this.props.notifyDirty}
              />
              <StatelessInput
                id="spa_pitch_d"
                notifyDirty={this.props.notifyDirty}
              />
              <StatelessInput
                id="spa_yaw_p"
                notifyDirty={this.props.notifyDirty}
              />
              <StatelessInput
                id="spa_yaw_i"
                notifyDirty={this.props.notifyDirty}
              />
              <StatelessInput
                id="spa_yaw_d"
                notifyDirty={this.props.notifyDirty}
              />
            </div>
          </Paper>
          <Paper>
            <div className="flex-center-start">
              <StatelessInput
                id="throttle_boost"
                notifyDirty={this.props.notifyDirty}
              />
              <StatelessInput
                id="i_decay"
                notifyDirty={this.props.notifyDirty}
              />
              <StatelessInput
                id="emu_boost"
                notifyDirty={this.props.notifyDirty}
              />
              <StatelessInput
                id="emu_boost_limit"
                notifyDirty={this.props.notifyDirty}
              />
              <StatelessInput
                id="emu_boost_yaw"
                notifyDirty={this.props.notifyDirty}
              />
              <StatelessInput
                id="emu_boost_limit_yaw"
                notifyDirty={this.props.notifyDirty}
              />
              <StatelessInput
                id="feathered_pids"
                notifyDirty={this.props.notifyDirty}
              />
            </div>
          </Paper>
        </div>
        <Paper className="flex-center">
          <StatelessInput
            notifyDirty={this.props.notifyDirty}
            key={this.props.fcConfig.tpa_rate_p.id}
            item={this.props.fcConfig.tpa_rate_p}
          />
          <StatelessInput
            notifyDirty={this.props.notifyDirty}
            key={this.props.fcConfig.tpa_rate_i.id}
            item={this.props.fcConfig.tpa_rate_i}
          />
          <StatelessInput
            notifyDirty={this.props.notifyDirty}
            key={this.props.fcConfig.tpa_rate_d.id}
            item={this.props.fcConfig.tpa_rate_d}
          />
          <StatelessInput
            notifyDirty={this.props.notifyDirty}
            key={this.props.fcConfig.tpa_breakpoint.id}
            item={this.props.fcConfig.tpa_breakpoint}
          />
        </Paper>
      </div>
    );
  }
}

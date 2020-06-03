import React from "react";
import ProfileView from "../ProfileView/ProfileView";
import DropdownView from "../Items/DropdownView";
import ConfigListView from "../ConfigListView/ConfigListView";
import TpaCurveView from "../TpaCurveView/TpaCurveView";
import Paper from "@material-ui/core/Paper";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Switch from "@material-ui/core/Switch";
import "./PidView.css";
import FCConnector from "../../utilities/FCConnector";
import { FormattedMessage } from "react-intl";
import PidProcessDenom from "./PidProcessDenom";
import GyroSyncDenom from "./GyroSyncDenom";
import StatelessInput from "../Items/StatelessInput";
import { FCConfigContext } from "../../App";

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
            <FormControlLabel
              control={
                <Switch
                  id={this.props.fcConfig.acc_hardware.id}
                  checked={this.props.fcConfig.acc_hardware.current !== "NONE"}
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
          </Paper>
        )}
        <Paper>
          <div style={{ margin: "0 auto", width: "800px" }}>
            <ConfigListView
              fcConfig={this.props.fcConfig}
              notifyDirty={this.props.notifyDirty}
              items={this.props.items}
            />
          </div>
        </Paper>
        {/* RF Style TPA, but leave it for future 
        {this.state.isRF1 && (
          <Paper className="flex-center">
            <FCConfigContext.Consumer>
              {config => {
                return config.tpa_type &&
                  config.tpa_type.current === "RACEFLIGHT" ? (
                  <TpaCurveView
                    notifyDirty={this.props.notifyDirty}
                    item={this.props.fcConfig.tpa_curves}
                  />
                ) : (
                  <div>
                    <StatelessInput
                      notifyDirty={this.props.notifyDirty}
                      item={this.props.fcConfig.tpa_breakpoint}
                    />
                    <StatelessInput
                      notifyDirty={this.props.notifyDirty}
                      item={this.props.fcConfig.tpa_rate}
                    />
                  </div>
                );
              }}
            </FCConfigContext.Consumer>
          </Paper>
        )}
        */}
      </div>
    );
  }
}

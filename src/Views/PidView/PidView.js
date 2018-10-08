import React from "react";
import ProfileView from "../ProfileView/ProfileView";
import DropdownView from "../Items/DropdownView";
import InputView from "../Items/InputView";
import ConfigListView from "../ConfigListView/ConfigListView";
import TpaCurveView from "../TpaCurveView/TpaCurveView";
import Paper from "@material-ui/core/Paper";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Switch from "@material-ui/core/Switch";
import "./PidView.css";
import FCConnector from "../../utilities/FCConnector";
import { FormattedMessage } from "react-intl";

export default class PidsView extends ProfileView {
  updatePidValues = newValue => {
    let use32K = this.props.fcConfig.gyro_use_32khz.current === "ON";
    let gyroItem = this.props.fcConfig.gyro_sync_denom;
    let pidItem = this.props.fcConfig.pid_process_denom;

    let gyroValues = use32K
      ? gyroItem.values
      : gyroItem.values.slice(2).map((item, i) => {
          return {
            value: i.toString(),
            label: item.label
          };
        });

    this.refs.gyroSyncDenomList.setState({
      values: gyroValues
    });

    let offset = 0;
    gyroValues.forEach((v, i) => {
      if (v.value === newValue) {
        offset = i;
      }
    });
    this.refs.pidProcessList.setState({
      values: gyroValues.slice(offset).map((item, index) => {
        return {
          value: pidItem.values[index].value,
          label: item.label
        };
      })
    });
  };
  componentDidMount = () => {
    if (this.state.isBxF) {
      this.updatePidValues(this.props.fcConfig.gyro_sync_denom.current);
      this.handleTpaChange(this.props.fcConfig.tpa_type.current);
    } else {
      return FCConnector.getTpaCurves(this.props.active).then(curves => {
        this.setState({ tpaCurves: curves });
      });
    }
  };
  handleTpaChange = newVal => {
    this.setState({ showTpaCurves: newVal === "RACEFLIGHT" });
  };
  getContent() {
    return (
      <div
        className="pid-view"
        style={{ display: "flex", flexDirection: "column" }}
      >
        {!this.state.isBxF &&
          this.state.tpaCurves && (
            <Paper theme={this.state.theme} elevation={3}>
              <TpaCurveView
                activeProfile={this.props.active}
                notifyDirty={this.props.notifyDirty}
                item={this.state.tpaCurves}
              />
            </Paper>
          )}
        {this.state.isBxF && (
          <Paper theme={this.state.theme} elevation={3}>
            <div>
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
                          this.updatePidValues("1");
                        });
                      });
                    }}
                  />
                }
                label={<FormattedMessage id="pid.gyro.use-32k" />}
              />
            </div>
            <DropdownView
              ref="gyroSyncDenomList"
              notifyDirty={(isDirty, state, payload) => {
                this.updatePidValues(payload);
                this.props.notifyDirty(isDirty, state, payload);
              }}
              item={this.props.fcConfig.gyro_sync_denom}
            />
            <DropdownView
              ref="pidProcessList"
              notifyDirty={this.props.notifyDirty}
              item={this.props.fcConfig.pid_process_denom}
            />
            <DropdownView
              notifyDirty={this.props.notifyDirty}
              item={this.props.fcConfig.buttered_pids}
            />
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
                      this.props.handleSave().then(() => {});
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
        <Paper
          theme={this.state.theme}
          elevation={3}
          style={{ margin: "10px", padding: "10px" }}
        >
          <div style={{ margin: "0 auto", width: "800px" }}>
            <ConfigListView
              notifyDirty={this.props.notifyDirty}
              items={this.props.items}
            />
          </div>
        </Paper>
        {!this.props.fcConfig.imuf && (
          <Paper
            theme={this.state.theme}
            elevation={3}
            style={{
              display: "flex",
              justifyItems: "center",
              alignItems: "center"
            }}
          >
            <DropdownView
              notifyDirty={this.props.notifyDirty}
              item={this.props.fcConfig.dterm_lowpass_hz_type}
            />
            <InputView
              notifyDirty={this.props.notifyDirty}
              key={this.props.fcConfig.dterm_lowpass_hz.id}
              item={this.props.fcConfig.dterm_lowpass_hz}
            />
            <InputView
              notifyDirty={this.props.notifyDirty}
              key={this.props.fcConfig.dterm_notch_hz.id}
              item={this.props.fcConfig.dterm_notch_hz}
            />
            <InputView
              notifyDirty={this.props.notifyDirty}
              key={this.props.fcConfig.dterm_notch_cutoff.id}
              item={this.props.fcConfig.dterm_notch_cutoff}
            />
          </Paper>
        )}

        {this.state.isBxF && (
          <Paper theme={this.state.theme} elevation={3}>
            <DropdownView
              notifyDirty={(isDirty, state, payload) => {
                this.handleTpaChange(payload);
                this.props.notifyDirty(isDirty, state, payload);
              }}
              item={this.props.fcConfig.tpa_type}
            />

            {this.state.showTpaCurves ? (
              <TpaCurveView
                notifyDirty={this.props.notifyDirty}
                item={this.props.fcConfig.tpa_curves}
              />
            ) : (
              <div>
                <InputView
                  notifyDirty={this.props.notifyDirty}
                  item={this.props.fcConfig.tpa_breakpoint}
                />
                <InputView
                  notifyDirty={this.props.notifyDirty}
                  item={this.props.fcConfig.tpa_rate}
                />
              </div>
            )}
          </Paper>
        )}
      </div>
    );
  }
}

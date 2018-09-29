import React from "react";
import ProfileView from "../ProfileView/ProfileView";
import DropdownView from "../Items/DropdownView";
import InputView from "../Items/InputView";
import ConfigListView from "../ConfigListView/ConfigListView";
import TpaCurveView from "../TpaCurveView/TpaCurveView";
import Paper from "@material-ui/core/Paper";
import theme from "../../Themes/Dark";
import "./PidView.css";

export default class PidsView extends ProfileView {
  updatePidValues = newValue => {
    let gyroItem = this.props.fcConfig.gyro_sync_denom;
    let pidItem = this.props.fcConfig.pid_process_denom;

    let offset = 0;
    gyroItem.values.forEach((v, i) => {
      if (v.value === newValue) {
        offset = i;
      }
    });
    this.refs.pidProcessList.setState({
      values: gyroItem.values.slice(offset).map((item, index) => {
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
        {this.state.isBxF && (
          <Paper
            theme={theme}
            elevation={3}
            style={{ margin: "10px", padding: "10px" }}
          >
            <DropdownView
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
          </Paper>
        )}
        <Paper
          theme={theme}
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
            theme={theme}
            elevation={3}
            style={{ margin: "10px", padding: "10px" }}
          >
            <DropdownView
              notifyDirty={this.props.notifyDirty}
              item={this.props.fcConfig.dterm_lowpass_hz_type}
            />
          </Paper>
        )}
        {!this.props.fcConfig.imuf && (
          <Paper
            theme={theme}
            elevation={3}
            style={{ margin: "10px", padding: "10px" }}
          >
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
          <Paper
            theme={theme}
            elevation={3}
            style={{ margin: "10px", padding: "10px" }}
          >
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

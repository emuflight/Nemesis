import React from "react";
import ProfileView from "../ProfileView/ProfileView";
import DropdownView from "../Items/DropdownView";
import InputView from "../Items/InputView";
import ConfigListView from "../ConfigListView/ConfigListView";
import TpaCurveView from "../TpaCurveView/TpaCurveView";
import Paper from "@material-ui/core/Paper";
import theme from "../../Themes/Dark";

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
    this.updatePidValues(this.props.fcConfig.gyro_sync_denom.current);
    this.handleTpaChange(this.props.fcConfig.tpa_type.current);
  };
  handleTpaChange = newVal => {
    this.setState({ showTpaCurves: newVal === "RACEFLIGHT" });
  };
  getContent() {
    return (
      <div style={{ display: "flex", flexDirection: "column" }}>
        <Paper
          theme={theme}
          elevation={3}
          style={{ margin: "10px", padding: "10px" }}
        >
          <DropdownView
            notifyDirty={(isDirty, state, payload) => {
              this.updatePidValues(payload);
              this.notifyDirty(isDirty, state, payload);
            }}
            item={this.props.fcConfig.gyro_sync_denom}
          />
          <DropdownView
            ref="pidProcessList"
            notifyDirty={this.notifyDirty}
            item={this.props.fcConfig.pid_process_denom}
          />
          <DropdownView
            notifyDirty={this.notifyDirty}
            item={this.props.fcConfig.buttered_pids}
          />
        </Paper>
        <Paper
          theme={theme}
          elevation={3}
          style={{ margin: "10px", padding: "10px" }}
        >
          <div style={{ margin: "0 auto", width: "800px" }}>
            <ConfigListView
              notifyDirty={this.notifyDirty}
              items={this.props.items}
            />
          </div>
        </Paper>
        <Paper
          theme={theme}
          elevation={3}
          style={{ margin: "10px", padding: "10px" }}
        >
          {!this.props.fcConfig.imuf && (
            <DropdownView
              notifyDirty={this.notifyDirty}
              item={this.props.fcConfig.dterm_lowpass_hz_type}
            />
          )}
        </Paper>
        {!this.props.fcConfig.imuf && (
          <Paper
            theme={theme}
            elevation={3}
            style={{ margin: "10px", padding: "10px" }}
          >
            <InputView
              notifyDirty={this.notifyDirty}
              key={this.props.fcConfig.dterm_lowpass_hz.id}
              item={this.props.fcConfig.dterm_lowpass_hz}
            />
            <InputView
              notifyDirty={this.notifyDirty}
              key={this.props.fcConfig.dterm_notch_hz.id}
              item={this.props.fcConfig.dterm_notch_hz}
            />
            <InputView
              notifyDirty={this.notifyDirty}
              key={this.props.fcConfig.dterm_notch_cutoff.id}
              item={this.props.fcConfig.dterm_notch_cutoff}
            />
          </Paper>
        )}

        <Paper
          theme={theme}
          elevation={3}
          style={{ margin: "10px", padding: "10px" }}
        >
          <DropdownView
            notifyDirty={(isDirty, state, payload) => {
              this.handleTpaChange(payload);
              this.notifyDirty(isDirty, state, payload);
            }}
            item={this.props.fcConfig.tpa_type}
          />

          {this.state.showTpaCurves ? (
            <TpaCurveView
              notifyDirty={this.notifyDirty}
              item={this.props.fcConfig.tpa_curves}
            />
          ) : (
            <div>
              <InputView
                notifyDirty={this.notifyDirty}
                item={this.props.fcConfig.tpa_breakpoint}
              />
              <InputView
                notifyDirty={this.notifyDirty}
                item={this.props.fcConfig.tpa_rate}
              />
            </div>
          )}
        </Paper>
      </div>
    );
  }
}

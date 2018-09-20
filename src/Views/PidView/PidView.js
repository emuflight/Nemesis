import React from "react";
import ProfileView from "../ProfileView/ProfileView";
import DropdownView from "../Items/DropdownView";
import InputView from "../Items/InputView";
import ConfigListView from "../ConfigListView/ConfigListView";
import TpaCurveView from "../TpaCurveView/TpaCurveView";
import Paper from "material-ui/Paper";
import { toSimpleConfigObj } from "../../utilities/utils";

export default class PidsView extends ProfileView {
  constructor(props) {
    super(props);
    props.fcConfig.gyro_sync_denom.values =
      props.uiConfig.elements.gyro_sync_denom.values;
    props.fcConfig.pid_process_denom.values =
      props.uiConfig.elements.pid_process_denom.values;
    props.fcConfig.pid_process_denom.id = "pid_process_denom";
    props.fcConfig.gyro_sync_denom.id = "gyro_sync_denom";
    props.fcConfig.buttered_pids.id = "buttered_pids";
    props.fcConfig.tpa_breakpoint.id = "tpa_breakpoint";
    props.fcConfig.tpa_rate.id = "tpa_rate";
    props.fcConfig.dterm_lowpass.id = "dterm_lowpass";
    props.fcConfig.dterm_notch_hz.id = "dterm_notch_hz";
    props.fcConfig.dterm_notch_cutoff.id = "dterm_notch_cutoff";
  }
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
        <Paper zDepth={3} style={{ margin: "10px", padding: "10px" }}>
          <DropdownView
            notifyDirty={(isDirty, state, payload) => {
              this.updatePidValues(payload);
              this.notifyDirty(isDirty, state, payload);
            }}
            id={"gyro_sync_denom"}
            item={this.props.fcConfig.gyro_sync_denom}
          />
          <DropdownView
            ref="pidProcessList"
            notifyDirty={this.notifyDirty}
            id={"pid_process_denom"}
            item={this.props.fcConfig.pid_process_denom}
          />
          <DropdownView
            id={"buttered_pids"}
            notifyDirty={this.notifyDirty}
            item={toSimpleConfigObj(
              this.props.fcConfig.buttered_pids,
              "buttered_pids"
            )}
          />
        </Paper>
        <Paper zDepth={3} style={{ margin: "10px", padding: "10px" }}>
          <div style={{ margin: "0 auto", width: "800px" }}>
            <ConfigListView
              notifyDirty={this.notifyDirty}
              items={this.props.items}
            />
          </div>
        </Paper>
        <Paper zDepth={3} style={{ margin: "10px", padding: "10px" }}>
          {!this.props.fcConfig.imuf && (
            <DropdownView
              id={"dterm_lowpass_type"}
              notifyDirty={this.notifyDirty}
              item={toSimpleConfigObj(
                this.props.fcConfig.dterm_lowpass_type,
                "dterm_lowpass_type"
              )}
            />
          )}
          <DropdownView
            id={"dterm_filter_style"}
            notifyDirty={this.notifyDirty}
            item={toSimpleConfigObj(
              this.props.fcConfig.dterm_filter_style,
              "dterm_filter_style"
            )}
          />
        </Paper>
        {!this.props.fcConfig.imuf && (
          <Paper zDepth={3} style={{ margin: "10px", padding: "10px" }}>
            <InputView
              notifyDirty={this.notifyDirty}
              key={this.props.fcConfig.dterm_lowpass.id}
              item={this.props.fcConfig.dterm_lowpass}
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

        <Paper zDepth={3} style={{ margin: "10px", padding: "10px" }}>
          <DropdownView
            id={"tpa_type"}
            notifyDirty={(isDirty, state, payload) => {
              this.handleTpaChange(payload);
              this.notifyDirty(isDirty, state, payload);
            }}
            item={toSimpleConfigObj(this.props.fcConfig.tpa_type, "tpa_type")}
          />

          {this.state.showTpaCurves ? (
            <TpaCurveView
              notifyDirty={this.notifyDirty}
              key={"tpa_curves"}
              item={this.props.fcConfig.tpa_curves}
            />
          ) : (
            <div>
              <InputView
                notifyDirty={this.notifyDirty}
                key={"tpa_breakpoint"}
                item={this.props.fcConfig.tpa_breakpoint}
              />
              <InputView
                notifyDirty={this.notifyDirty}
                key={"tpa_rate"}
                item={this.props.fcConfig.tpa_rate}
              />
            </div>
          )}
        </Paper>
      </div>
    );
  }
}

import React from "react";
import ProfileView from "../ProfileView/ProfileView";
import DropdownView from "../Items/DropdownView";
import InputView from "../Items/InputView";
import ConfigListView from "../ConfigListView/ConfigListView";
import TpaCurveView from "../TpaCurveView/TpaCurveView";

const mapToLabel = k => {
  return {
    label: k,
    value: k
  };
};

export default class PidsView extends ProfileView {
  constructor(props) {
    super(props);
    props.fcConfig.gyro_sync_denom.values =
      props.uiConfig.elements.gyro_sync_denom.values;
    props.fcConfig.pid_process_denom.values =
      props.uiConfig.elements.pid_process_denom.values;
    props.fcConfig.buttered_pids.values = props.fcConfig.buttered_pids.values.map(
      mapToLabel
    );
    props.fcConfig.tpa_type.values = props.fcConfig.tpa_type.values.map(
      mapToLabel
    );
    props.fcConfig.pid_process_denom.id = "pid_process_denom";
    props.fcConfig.gyro_sync_denom.id = "gyro_sync_denom";
    props.fcConfig.buttered_pids.id = "buttered_pids";
    props.fcConfig.tpa_type.id = "tpa_type";
    props.fcConfig.tpa_breakpoint.id = "tpa_breakpoint";
    props.fcConfig.tpa_rate.id = "tpa_rate";
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
        <div style={{ display: "flex" }}>
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
            item={this.props.fcConfig.buttered_pids}
          />
        </div>
        <div>
          <div style={{ margin: "0 auto", width: "800px" }}>
            <ConfigListView
              notifyDirty={this.notifyDirty}
              items={this.props.items}
            />
          </div>
        </div>
        <div>
          <DropdownView
            id={"tpa_type"}
            notifyDirty={(isDirty, state, payload) => {
              this.handleTpaChange(payload);
              this.notifyDirty(isDirty, state, payload);
            }}
            item={this.props.fcConfig.tpa_type}
          />
        </div>
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
      </div>
    );
  }
}

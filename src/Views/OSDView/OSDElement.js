import React, { Component } from "react";
import SignalCellularAltSharp from "@material-ui/icons/SignalCellularAltSharp";
import BatteryCharging80Sharp from "@material-ui/icons/BatteryCharging80Sharp";
import FlareSharp from "@material-ui/icons/FlareSharp";
import ArrowDropUpSharp from "@material-ui/icons/ArrowDropUpSharp";
import GpsFixedSharp from "@material-ui/icons/GpsFixedSharp";

const OSDExamples = {
  osd_vbat_pos: (
    <span className="osd-icon-label">
      <BatteryCharging80Sharp className="osd-icon" />
      <span>24.8V</span>
    </span>
  ),
  osd_rssi_pos: (
    <span className="osd-icon-label">
      <SignalCellularAltSharp className="osd-icon" />
      <span>99</span>
    </span>
  ),
  osd_tim_1_pos: <span className="osd-icon-label">&nbsp;1:00</span>,
  osd_tim_2_pos: <span className="osd-icon-label">&nbsp;2:00</span>,
  osd_remaining_time_estimate_pos: (
    <span className="osd-icon-label">&nbsp;0:42</span>
  ),
  osd_flymode_pos: <span className="osd-icon-label">HORIZON</span>,
  osd_throttle_pos: (
    <span className="osd-icon-label">
      &#167;
      <ArrowDropUpSharp className="osd-icon" />
      42
    </span>
  ),
  osd_vtx_channel_pos: (
    <span className="osd-icon-label">R&nbsp;:&nbsp;5&nbsp;:&nbsp;3</span>
  ),
  osd_crosshairs_pos: <FlareSharp className="osd-icon" />,
  osd_ah_sbar_pos: (
    <div className="ah_sidebar">
      <div className="ah_sidebar-left">--------</div>
      <div className="ah_sidebar-mid" />
      <div className="ah_sidebar-right">--------</div>
    </div>
  ),
  osd_ah_pos: (
    <div className="ah_bar">
      <div>
        -----
        <FlareSharp className="osd-icon" />
        -----
      </div>
    </div>
  ),
  osd_current_pos: (
    <span className="osd-icon-label">
      <sub>A</sub>
      42.00
    </span>
  ),
  osd_mah_drawn_pos: (
    <span className="osd-icon-label">
      <span>1337</span>
      <sub className="mah">
        <div>mA</div>h
      </sub>
    </span>
  ),
  osd_gps_speed_pos: <span className="osd-icon-label">40K</span>,
  osd_gps_lon_pos: <span className="osd-icon-label">&#8680;-000.0000000</span>,
  osd_gps_lat_pos: <span className="osd-icon-label">&#8681;-000.0000000</span>,
  osd_gps_sats_pos: (
    <span className="osd-icon-label">
      <GpsFixedSharp className="osd-icon" />
      <span>14</span>
    </span>
  ),
  osd_home_dir_pos: <span className="osd-icon-label">&#8600;</span>,
  osd_home_dist_pos: (
    <span className="osd-icon-label">
      42
      <sub>M</sub>
      &nbsp;&nbsp;&nbsp;&nbsp;
    </span>
  ),
  osd_compass_bar_pos: (
    <span className="osd-icon-label">
      <div className="compass-bar">
        <div>|'''|'''|</div>
        <div>W&nbsp;&nbsp;&nbsp;N&nbsp;&nbsp;&nbsp;E</div>
      </div>
    </span>
  ),
  osd_altitude_pos: (
    <span className="osd-icon-label">
      &nbsp;399.7
      <sub>M</sub>
    </span>
  ),
  osd_pid_roll_pos: (
    <span className="osd-icon-label">
      ROL&nbsp;&nbsp;42&nbsp;&nbsp;42&nbsp;&nbsp;42
    </span>
  ),
  osd_pid_pitch_pos: (
    <span className="osd-icon-label">
      PIT&nbsp;&nbsp;42&nbsp;&nbsp;42&nbsp;&nbsp;42
    </span>
  ),
  osd_pid_yaw_pos: (
    <span className="osd-icon-label">
      YAW&nbsp;&nbsp;42&nbsp;&nbsp;42&nbsp;&nbsp;42
    </span>
  ),
  osd_debug_pos: (
    <span className="osd-icon-label">
      DBG&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;0&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;0&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;0&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;0
    </span>
  ),
  osd_power_pos: <span className="osd-icon-label">&nbsp;&nbsp;142W</span>,
  osd_pidrate_profile_pos: <span className="osd-icon-label">1-2</span>,
  osd_warnings_pos: <span className="osd-icon-label">LOW VOLTAGE</span>,
  osd_avg_cell_voltage_pos: (
    <span className="osd-icon-label">
      <BatteryCharging80Sharp className="osd-icon" />
      <span>
        4.12
        <sub>V</sub>
      </span>
    </span>
  ),
  osd_pit_ang_pos: <span className="osd-icon-label">-00.0</span>,
  osd_rol_ang_pos: <span className="osd-icon-label">-00.0</span>,
  osd_battery_usage_pos: <span className="osd-icon-label">============</span>,
  osd_disarmed_pos: <span className="osd-icon-label">DISARMED</span>,
  osd_nheading_pos: <span className="osd-icon-label">&#8680;42</span>,
  osd_nvario_pos: <span className="osd-icon-label">&#8679;8.7</span>,
  osd_esc_tmp_pos: (
    <span className="osd-icon-label">
      &#176;
      <sub>C</sub>
      42
    </span>
  ),
  osd_esc_rpm_pos: <span className="osd-icon-label">29001</span>,
  osd_rtc_date_time_pos: (
    <span className="osd-icon-label">2045-12-20&nbsp;19:00:00</span>
  ),
  osd_adjustment_range_pos: (
    <span className="osd-icon-label">PITCH/ROLL&nbsp;P:&nbsp;42</span>
  ),
  osd_core_temp_pos: <span className="osd-icon-label">33C</span>
};

export default class OSDElement extends Component {
  constructor(props) {
    super(props);
    OSDExamples.osd_craft_name_pos = (
      <span className="osd-icon-label craft_name">
        {this.props.fcConfig.name || "craft_name"}
      </span>
    );
  }
  render() {
    return OSDExamples[this.props.id] || <span>{this.props.id}</span>;
  }
}

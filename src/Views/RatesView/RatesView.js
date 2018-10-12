import React from "react";
import ProfileView from "../ProfileView/ProfileView";
import ConfigListView from "../ConfigListView/ConfigListView";
import DropdownView from "../Items/DropdownView";
import Paper from "@material-ui/core/Paper";
import "./RatesView.css";
import { Typography, TextField } from "@material-ui/core";
import { FormattedMessage } from "react-intl";
import StatelessInput from "../Items/StatelessInput";
import StatelessFloat from "../Items/StatelessFloat";
import { AreaChart } from "react-easy-chart";
import "./RatesView.css";
import { FCConfigContext } from "../../App";

export default class RatesView extends ProfileView {
  //these are the actual calculations from the functions applyBetaflightRates anf applyRaceflightRates
  calcDps(input, rate, expo, superRate, deadband) {
    let actualCommand = input - deadband;
    if (expo) {
      let expof = expo * 0.01;
      actualCommand =
        actualCommand * Math.pow(Math.abs(actualCommand), 3) * expof +
        actualCommand * (1 - expof);
    }

    let rcRate = rate * 0.01;
    if (rcRate > 2.0) {
      rcRate += 14.54 * (rcRate - 2.0);
    }
    let angleRate = 200.0 * rcRate * actualCommand;
    if (superRate) {
      let rcSuperfactor =
        1.0 /
        Math.min(
          Math.max(1.0 - Math.abs(actualCommand) * (superRate / 100.0), 0.01),
          1.0
        );
      angleRate *= rcSuperfactor;
    }
    return Math.ceil(angleRate);
  }
  calcDpsRf1(input, rcRate, expo, superRate, deadband) {
    let actualCommand = input - deadband;
    let rcCommand =
      (1.0 + 0.01 * expo * (actualCommand * actualCommand - 1.0)) *
      actualCommand;
    let angleRate = 10.0 * rcRate * rcCommand;
    angleRate = angleRate * (1 + Math.abs(actualCommand) * superRate * 0.01);
    return Math.ceil(angleRate);
  }
  generateCurves(config) {
    let bfRates = config.rates_type.current === "BETAFLIGHT";
    let rateFunc = bfRates ? this.calcDps : this.calcDpsRf1;
    const rates = {
      roll: {
        r: parseFloat(config.roll_rc_rate.current),
        x: parseFloat(config.roll_expo.current),
        s: parseFloat(config.roll_srate.current),
        d: parseInt(config.deadband.current, 10) / 100
      },
      pitch: {
        r: parseFloat(config.pitch_rc_rate.current),
        x: parseFloat(config.pitch_expo.current),
        s: parseFloat(config.pitch_srate.current),
        d: parseInt(config.deadband.current, 10) / 100
      },
      yaw: {
        r: parseFloat(config.yaw_rc_rate.current),
        x: parseFloat(config.yaw_expo.current),
        s: parseFloat(config.yaw_srate.current),
        d: parseInt(config.yaw_deadband.current, 10) / 100
      }
    };
    let xcurve = [];
    let ycurve = [];
    let zcurve = [];
    new Array(11).fill(0).forEach((v, i) => {
      let percent = i * 10;
      let stickVal = percent * 0.01;
      xcurve.push({
        x: percent,
        y: rateFunc(
          stickVal,
          rates.roll.r,
          rates.roll.x,
          rates.roll.s,
          rates.roll.d
        )
      });
      ycurve.push({
        x: percent,
        y: rateFunc(
          stickVal,
          rates.pitch.r,
          rates.pitch.x,
          rates.pitch.s,
          rates.pitch.d
        )
      });
      zcurve.push({
        x: percent,
        y: rateFunc(
          stickVal,
          rates.yaw.r,
          rates.yaw.x,
          rates.yaw.s,
          rates.yaw.d
        )
      });
    });
    return {
      x: xcurve,
      y: ycurve,
      z: zcurve
    };
  }

  get children() {
    if (!this.state.isBxF) {
      return (
        <ConfigListView
          fcConfig={this.props.fcConfig}
          notifyDirty={this.props.notifyDirty}
          items={this.props.items}
        />
      );
    }
    return (
      <div
        className="rates-view"
        style={{ display: "flex", flex: 1, flexDirection: "column" }}
      >
        <Paper
          elevation={3}
          style={{
            display: "flex",
            justifyItems: "center",
            alignItems: "center"
          }}
        >
          <StatelessFloat
            notifyDirty={this.props.notifyDirty}
            item={this.props.fcConfig.thr_expo}
          />
          <StatelessFloat
            notifyDirty={this.props.notifyDirty}
            item={this.props.fcConfig.thr_mid}
          />
          <StatelessInput
            notifyDirty={this.props.notifyDirty}
            item={this.props.fcConfig.deadband}
          />
          <StatelessInput
            notifyDirty={this.props.notifyDirty}
            item={this.props.fcConfig.yaw_deadband}
          />
          <DropdownView
            notifyDirty={(isDirty, state, val) => {
              this.props.fcConfig.rates_type.current = val;
              this.forceUpdate();
              this.props.notifyDirty(isDirty, state, val);
            }}
            item={this.props.fcConfig.rates_type}
          />
        </Paper>
        <FCConfigContext.Consumer>
          {config => {
            let curves = this.generateCurves(config);
            return (
              <div style={{ display: "flex" }}>
                <div
                  style={{ display: "flex", flex: 1, flexDirection: "column" }}
                >
                  <Paper elevation={3}>
                    <Typography>
                      <FormattedMessage id="common.roll" />
                    </Typography>
                    <StatelessFloat
                      notifyDirty={this.props.notifyDirty}
                      item={this.props.fcConfig.roll_rc_rate}
                    />
                    <StatelessFloat
                      notifyDirty={this.props.notifyDirty}
                      item={this.props.fcConfig.roll_srate}
                    />
                    <StatelessFloat
                      notifyDirty={this.props.notifyDirty}
                      item={this.props.fcConfig.roll_expo}
                    />
                    <TextField
                      style={{ width: 90 }}
                      disabled={true}
                      label={
                        <span className="color-legend white">
                          <FormattedMessage id="rates.max-dps" />
                        </span>
                      }
                      value={curves.x[10].y}
                    />
                  </Paper>
                  <Paper elevation={3}>
                    <Typography>
                      <FormattedMessage id="common.pitch" />
                    </Typography>
                    <StatelessFloat
                      notifyDirty={this.props.notifyDirty}
                      item={this.props.fcConfig.pitch_rc_rate}
                    />
                    <StatelessFloat
                      notifyDirty={this.props.notifyDirty}
                      item={this.props.fcConfig.pitch_srate}
                    />
                    <StatelessFloat
                      notifyDirty={this.props.notifyDirty}
                      item={this.props.fcConfig.pitch_expo}
                    />
                    <TextField
                      style={{ width: 90 }}
                      disabled={true}
                      label={
                        <span className="color-legend blue">
                          <FormattedMessage id="rates.max-dps" />
                        </span>
                      }
                      value={curves.y[10].y}
                    />
                  </Paper>
                  <Paper elevation={3}>
                    <Typography>
                      <FormattedMessage id="common.yaw" />
                    </Typography>
                    <StatelessFloat
                      notifyDirty={this.props.notifyDirty}
                      item={this.props.fcConfig.yaw_rc_rate}
                    />
                    <StatelessFloat
                      notifyDirty={this.props.notifyDirty}
                      item={this.props.fcConfig.yaw_srate}
                    />
                    <StatelessFloat
                      notifyDirty={this.props.notifyDirty}
                      item={this.props.fcConfig.yaw_expo}
                    />
                    <TextField
                      style={{ width: 90 }}
                      disabled={true}
                      label={
                        <span className="color-legend green">
                          <FormattedMessage id="rates.max-dps" />
                        </span>
                      }
                      value={curves.z[10].y}
                    />
                  </Paper>
                </div>
                <Paper elevation={3}>
                  <AreaChart
                    xType={"text"}
                    areaColors={["white", "blue", "green"]}
                    interpolate={"cardinal"}
                    axisLabels={{ x: "Stick Midpoint %", y: "Deg / sec" }}
                    yAxisOrientRight
                    axes
                    xTicks={0}
                    width={450}
                    height={350}
                    margin={{ top: 0, left: 0, bottom: 50, right: 50 }}
                    data={[curves.x, curves.y, curves.z]}
                  />
                </Paper>
              </div>
            );
          }}
        </FCConfigContext.Consumer>
      </div>
    );
  }
}

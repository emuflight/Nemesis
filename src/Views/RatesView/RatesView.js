import React from "react";
import ProfileView from "../ProfileView/ProfileView";
import ConfigListView from "../ConfigListView/ConfigListView";
import DropdownView from "../Items/DropdownView";
import Paper from "@material-ui/core/Paper";
import "./RatesView.css";
import { Typography, TextField } from "@material-ui/core";
import { FormattedMessage } from "react-intl";
import FloatView from "../Items/FloatView";
import InputView from "../Items/InputView";
import { AreaChart } from "react-easy-chart";

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
  getContent() {
    if (!this.state.isBxF) {
      return (
        <ConfigListView
          notifyDirty={this.props.notifyDirty}
          items={this.props.items}
        />
      );
    }
    let bfRates = this.props.fcConfig.rates_type.current === "BETAFLIGHT";
    let rateFunc = bfRates ? this.calcDps : this.calcDpsRf1;
    const rates = {
      roll: {
        r: parseFloat(this.props.fcConfig.roll_rc_rate.current),
        x: parseFloat(this.props.fcConfig.roll_expo.current),
        s: parseFloat(this.props.fcConfig.roll_srate.current),
        d: parseInt(this.props.fcConfig.deadband.current, 10) / 100
      },
      pitch: {
        r: parseFloat(this.props.fcConfig.pitch_rc_rate.current),
        x: parseFloat(this.props.fcConfig.pitch_expo.current),
        s: parseFloat(this.props.fcConfig.pitch_srate.current),
        d: parseInt(this.props.fcConfig.deadband.current, 10) / 100
      },
      yaw: {
        r: parseFloat(this.props.fcConfig.yaw_rc_rate.current),
        x: parseFloat(this.props.fcConfig.yaw_expo.current),
        s: parseFloat(this.props.fcConfig.yaw_srate.current),
        d: parseInt(this.props.fcConfig.yaw_deadband.current, 10) / 100
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
    return (
      <div style={{ display: "flex", flex: 1, flexDirection: "column" }}>
        <Paper
          theme={this.state.theme}
          elevation={3}
          style={{
            display: "flex",
            justifyItems: "center",
            alignItems: "center"
          }}
        >
          <FloatView
            notifyDirty={this.props.notifyDirty}
            item={this.props.fcConfig.thr_expo}
          />
          <FloatView
            notifyDirty={this.props.notifyDirty}
            item={this.props.fcConfig.thr_mid}
          />
          <InputView
            notifyDirty={this.props.notifyDirty}
            item={this.props.fcConfig.deadband}
          />
          <InputView
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
        <div style={{ display: "flex" }}>
          <div style={{ display: "flex", flex: 1, flexDirection: "column" }}>
            <Paper theme={this.state.theme} elevation={3}>
              <Typography>
                <FormattedMessage id="common.roll" />
              </Typography>
              <FloatView
                notifyDirty={this.props.notifyDirty}
                item={this.props.fcConfig.roll_rc_rate}
              />
              <FloatView
                notifyDirty={this.props.notifyDirty}
                item={this.props.fcConfig.roll_srate}
              />
              <FloatView
                notifyDirty={this.props.notifyDirty}
                item={this.props.fcConfig.roll_expo}
              />
              <TextField
                style={{ width: 90 }}
                disabled={true}
                label={<FormattedMessage id="rates.max-dps" />}
                value={xcurve[10].y}
              />
            </Paper>
            <Paper theme={this.state.theme} elevation={3}>
              <Typography>
                <FormattedMessage id="common.pitch" />
              </Typography>
              <FloatView
                notifyDirty={this.props.notifyDirty}
                item={this.props.fcConfig.pitch_rc_rate}
              />
              <FloatView
                notifyDirty={this.props.notifyDirty}
                item={this.props.fcConfig.pitch_srate}
              />
              <FloatView
                notifyDirty={this.props.notifyDirty}
                item={this.props.fcConfig.pitch_expo}
              />
              <TextField
                style={{ width: 90 }}
                disabled={true}
                label={<FormattedMessage id="rates.max-dps" />}
                value={ycurve[10].y}
              />
            </Paper>
            <Paper theme={this.state.theme} elevation={3}>
              <Typography>
                <FormattedMessage id="common.yaw" />
              </Typography>
              <FloatView
                notifyDirty={this.props.notifyDirty}
                item={this.props.fcConfig.yaw_rc_rate}
              />
              <FloatView
                notifyDirty={this.props.notifyDirty}
                item={this.props.fcConfig.yaw_srate}
              />
              <FloatView
                notifyDirty={this.props.notifyDirty}
                item={this.props.fcConfig.yaw_expo}
              />

              <TextField
                style={{ width: 90 }}
                disabled={true}
                label={<FormattedMessage id="rates.max-dps" />}
                value={zcurve[10].y}
              />
            </Paper>
          </div>
          <Paper theme={this.state.theme} elevation={3}>
            <AreaChart
              xType={"text"}
              areaColors={["white", "blue", "green"]}
              interpolate={"cardinal"}
              axwsLabels={{ x: "DPS", y: "RC" }}
              yAxisOrientRight
              axes
              xTicks={0}
              width={450}
              height={350}
              data={[xcurve, ycurve, zcurve]}
            />
          </Paper>
        </div>
      </div>
    );
  }
}

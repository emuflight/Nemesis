import React from "react";
import ProfileView from "../ProfileView/ProfileView";
import DropdownView from "../Items/DropdownView";
import Paper from "@material-ui/core/Paper";
import "./RatesView.css";
import { Typography, TextField } from "@material-ui/core";
import { FormattedMessage } from "react-intl";
import StatelessInput from "../Items/StatelessInput";
import StatelessFloat from "../Items/StatelessFloat";
import { AreaChart } from "react-easy-chart";
import "./RatesView.css";

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
  calcDpsRf(input, rcRate, expo, superRate, deadband) {
    let actualCommand = input - deadband;
    let rcCommand =
      (1.0 + 0.01 * expo * (actualCommand * actualCommand - 1.0)) *
      actualCommand;
    let angleRate = 10.0 * rcRate * rcCommand;
    angleRate = angleRate * (1 + Math.abs(actualCommand) * superRate * 0.01);
    return Math.ceil(angleRate);
  }

  getRateFunc(curveToUse) {
    let maxOutput, maxOutputMod, returnValue;
    let flopSuperRate, flopRcRate, flopExpo, flopFactor;
    let kissSetpoint,
      kissRate,
      kissGRate,
      kissUseCurve,
      kissTempCurve,
      kissRpyUseRates,
      kissRxRaw,
      kissAngle;

    maxOutput = 1;
    maxOutputMod = 0.01;

    const constrain = (amt, low, high) => {
      if (amt < low) return low;
      else if (amt > high) return high;
      return amt;
    };

    switch (curveToUse) {
      case "3":
        return (rcCommand, rate, expo, acrop) => {
          returnValue =
            (maxOutput + maxOutputMod * expo * (rcCommand * rcCommand - 1.0)) *
            rcCommand;
          returnValue = returnValue * (rate + rate * acrop * 0.01);
          return returnValue;
        };
      case "4":
        return (rcCommand, rate, expo, acrop) => {
          returnValue =
            (maxOutput + maxOutputMod * expo * (rcCommand * rcCommand - 1.0)) *
            rcCommand;
          returnValue =
            returnValue * (rate + Math.abs(returnValue) * rate * acrop * 0.01);
          return returnValue;
        };
      case "5":
        return (rcCommand, rate, expo, acrop) => {
          kissUseCurve = expo;
          kissRate = acrop;
          kissGRate = rate;
          kissSetpoint = rcCommand;

          kissRpyUseRates = 1 - Math.abs(rcCommand) * kissGRate;
          kissRxRaw = rcCommand * 1000;
          kissTempCurve = (kissRxRaw * kissRxRaw) / 1000000;
          kissSetpoint =
            (kissSetpoint * kissTempCurve * kissUseCurve +
              kissSetpoint * (1 - kissUseCurve)) *
            (kissRate / 10);
          kissAngle = 2000.0 * (1.0 / kissRpyUseRates) * kissSetpoint; //setpoint is calculated directly here
          return kissAngle;
        };
      case "7":
        return (rcCommand, rate, expo, acrop) => {
          flopExpo = expo;
          flopRcRate = acrop;
          flopSuperRate = rate;

          if (flopRcRate > 2.0)
            flopRcRate = flopRcRate + 14.55 * (flopRcRate - 2.0);

          if (flopExpo !== 0.0)
            rcCommand =
              rcCommand * Math.pow(Math.abs(rcCommand), 3) * flopExpo +
              rcCommand * (1.0 - flopExpo);

          let flopAngle = 200.0 * flopRcRate * rcCommand;

          if (flopSuperRate !== 0.0) {
            flopFactor =
              1.0 /
              constrain(1.0 - Math.abs(rcCommand) * flopSuperRate, 0.01, 1.0);
            flopAngle *= flopFactor; //setpoint is calculated directly here
          }
          return flopAngle;
        };
      default:
        return (rcCommand, rate, expo, acrop) => {
          return rcCommand; //same as default for now.
        };
    }
  }
  generateCurves(rates, rateFunc) {
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
    return this.bxfRateView;
  }

  get rf1RateView() {
    let config = this.props.fcConfig;
    let profNum = config.currentRateProfile + 1;
    const rates = {
      roll: {
        r: parseFloat(config[`roll_rate${profNum}`].current),
        x: parseFloat(config[`roll_expo${profNum}`].current),
        s: parseFloat(config[`roll_acrop${profNum}`].current),
        d: parseInt(config.roll_deadband.current, 10) / 100
      },
      pitch: {
        r: parseFloat(config[`pitch_rate${profNum}`].current),
        x: parseFloat(config[`pitch_expo${profNum}`].current),
        s: parseFloat(config[`pitch_acrop${profNum}`].current),
        d: parseInt(config.pitch_deadband.current, 10) / 100
      },
      yaw: {
        r: parseFloat(config[`yaw_rate${profNum}`].current),
        x: parseFloat(config[`yaw_expo${profNum}`].current),
        s: parseFloat(config[`yaw_acrop${profNum}`].current),
        d: parseInt(config.yaw_deadband.current, 10) / 100
      }
    };

    let curves = this.generateCurves(
      rates,
      this.getRateFunc(config[`stick_curve${profNum}`].current)
    );
    console.log(curves);
    return this.getRatesView(
      curves,
      Object.assign(
        {
          rates_type: config[`stick_curve${profNum}`],
          roll_rc_rate: config[`roll_rate${profNum}`],
          roll_srate: config[`roll_acrop${profNum}`],
          roll_expo: config[`roll_expo${profNum}`],
          pitch_rc_rate: config[`pitch_rate${profNum}`],
          pitch_srate: config[`pitch_acrop${profNum}`],
          pitch_expo: config[`pitch_expo${profNum}`],
          yaw_rc_rate: config[`yaw_rate${profNum}`],
          yaw_srate: config[`yaw_acrop${profNum}`],
          yaw_expo: config[`yaw_expo${profNum}`],
          rate_center_sensitivity: config[`rate_center_sensitivity${profNum}`],
          rate_end_sensitivity: config[`rate_end_sensitivity${profNum}`],
          rate_center_correction: config[`rate_center_correction${profNum}`],
          rate_end_correction: config[`rate_end_correction${profNum}`],
          rate_center_weight: config[`rate_center_weight${profNum}`],
          rate_end_weight: config[`rate_end_weight${profNum}`]
        },
        config
      )
    );
  }

  get bxfRateView() {
    let config = this.props.fcConfig;
    let rateFunc =
      config.rates_type.current === "BETAFLIGHT"
        ? this.calcDps
        : this.calcDpsRf;
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
    let curves = this.generateCurves(rates, rateFunc);
    return this.getRatesView(curves, config);
  }

  getRatesView(curves, fields) {
    return (
      <div className="rates-view">
        <Paper className="flex-center">
          {fields.thr_expo && (
            <StatelessFloat
              notifyDirty={this.props.notifyDirty}
              item={fields.thr_expo}
            />
          )}
          {fields.thr_mid && (
            <StatelessFloat
              notifyDirty={this.props.notifyDirty}
              item={fields.thr_mid}
            />
          )}
          {fields.throttle_midrc && (
            <StatelessInput
              notifyDirty={this.props.notifyDirty}
              item={fields.throttle_midrc}
            />
          )}
          {fields.roll_deadband && (
            <StatelessInput
              notifyDirty={this.props.notifyDirty}
              item={fields.roll_deadband}
            />
          )}
          {fields.pitch_deadband && (
            <StatelessInput
              notifyDirty={this.props.notifyDirty}
              item={fields.pitch_deadband}
            />
          )}
          {fields.deadband && (
            <StatelessInput
              notifyDirty={this.props.notifyDirty}
              item={fields.deadband}
            />
          )}
          <StatelessInput
            notifyDirty={this.props.notifyDirty}
            item={fields.yaw_deadband}
          />
          {fields.rates_type && (
            <DropdownView
              notifyDirty={(isDirty, state, val) => {
                fields.current = val;
                this.forceUpdate();
                this.props.notifyDirty(isDirty, state, val);
              }}
              item={fields.rates_type}
            />
          )}
        </Paper>

        <div style={{ display: "flex" }}>
          <div style={{ display: "flex", flex: 1, flexDirection: "column" }}>
            <Paper>
              <Typography variant="h6">
                <FormattedMessage id="rate_paper" />
              </Typography>
              <Typography>
                <FormattedMessage id="common.roll" />
              </Typography>
              <StatelessFloat
                notifyDirty={this.props.notifyDirty}
                item={fields.roll_rc_rate}
              />
              <StatelessFloat
                notifyDirty={this.props.notifyDirty}
                item={fields.roll_srate}
              />
              <StatelessFloat
                notifyDirty={this.props.notifyDirty}
                item={fields.roll_expo}
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
              <Typography>
                <FormattedMessage id="common.pitch" />
              </Typography>
              <StatelessFloat
                notifyDirty={this.props.notifyDirty}
                item={fields.pitch_rc_rate}
              />
              <StatelessFloat
                notifyDirty={this.props.notifyDirty}
                item={fields.pitch_srate}
              />
              <StatelessFloat
                notifyDirty={this.props.notifyDirty}
                item={fields.pitch_expo}
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
              <Typography>
                <FormattedMessage id="common.yaw" />
              </Typography>
              <StatelessFloat
                notifyDirty={this.props.notifyDirty}
                item={fields.yaw_rc_rate}
              />
              <StatelessFloat
                notifyDirty={this.props.notifyDirty}
                item={fields.yaw_srate}
              />
              <StatelessFloat
                notifyDirty={this.props.notifyDirty}
                item={fields.yaw_expo}
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
            <div style={{ display: "flex", flex: 1, flexDirection: "column" }}>
              <Paper>
                <Typography variant="h6">
                  <FormattedMessage id="rate_dynamics" />
                </Typography>
                <Typography>
                  <FormattedMessage id="rate_center" />
                </Typography>
                <StatelessFloat
                  notifyDirty={this.props.notifyDirty}
                  item={fields.rate_center_sensitivity}
                />
                <StatelessFloat
                  notifyDirty={this.props.notifyDirty}
                  item={fields.rate_center_correction}
                />
                <StatelessFloat
                  notifyDirty={this.props.notifyDirty}
                  item={fields.rate_center_weight}
                />
                <Typography>
                  <FormattedMessage id="rate_end" />
                </Typography>
                <StatelessFloat
                  notifyDirty={this.props.notifyDirty}
                  item={fields.rate_end_sensitivity}
                />
                <StatelessFloat
                  notifyDirty={this.props.notifyDirty}
                  item={fields.rate_end_correction}
                />
                <StatelessFloat
                  notifyDirty={this.props.notifyDirty}
                  item={fields.rate_end_weight}
                />
              </Paper>
            </div>
          </div>

          <Paper>
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
              margin={{ top: 10, left: 10, bottom: 50, right: 50 }}
              data={[curves.x, curves.y, curves.z]}
            />
          </Paper>
        </div>
      </div>
    );
  }
}

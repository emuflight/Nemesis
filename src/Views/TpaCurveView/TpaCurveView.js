import React, { Component } from "react";
import VerticalSliderView from "../Items/VerticalSliderView";
import FCConnector from "../../utilities/FCConnector";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import { FormattedMessage } from "react-intl";
import "./TpaCurveItem.css";
const formatCurveItems = array => {
  return array.map((item, i) => {
    return {
      id: "curve" + i,
      current: parseInt(item, 10),
      min: 60,
      max: 140,
      step: 1,
      axis: "y",
      element: {
        type: "slider"
      }
    };
  });
};

export default class TpaCurveView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showCurves: false,
      kp: formatCurveItems(props.item.kp),
      ki: formatCurveItems(props.item.ki),
      kd: formatCurveItems(props.item.kd)
    };
  }

  updateValue(k, i, val) {
    let updateObj = {};
    updateObj[k] = this.state[k];
    updateObj[k][i].current = val;
    let middle = updateObj[k][i];
    let left = updateObj[k][i - 1];
    let right = updateObj[k][i + 1];
    if (left) {
      left.current = Math.floor((middle.current + left.current) / 2);
    }
    if (right) {
      right.current = Math.floor((middle.current + right.current) / 2);
    }
    this.setState(updateObj);
    return FCConnector.setTpaCurves(
      k,
      this.props.activeProfile,
      this.state[k].map(item => item.current).join("=")
    ).then(() => this.props.notifyDirty(true, this.state, val));
  }
  render() {
    return (
      <div>
        <div>
          <Button
            onClick={() => {
              this.setState({ showCurves: !this.state.showCurves });
            }}
            color="primary"
          >
            {`${this.state.showCurves ? "Hide" : "Show"} TPA`}
          </Button>
        </div>
        {this.state.showCurves && (
          <div
            style={{
              margin: "0 auto",
              width: "720px",
              display: "flex",
              flexDirection: "column"
            }}
          >
            <Typography variant="headline">
              <FormattedMessage id="pid.tpa.curves" />
            </Typography>
            <div
              style={{
                marginTop: 10,
                display: "flex",
                flexDirection: "column",
                margin: "0 auto"
              }}
            >
              <Typography>
                <FormattedMessage id="pid.kp" />
              </Typography>

              <div style={{ display: "flex" }}>
                {this.state.kp.map((item, i) => {
                  return (
                    <VerticalSliderView
                      labelClassName="tpa-slider-control-label"
                      sliderClassName="tpa-slider-control-slider"
                      style={{ width: 40 }}
                      textInputProps={{
                        className: "tpa-slider-control-input"
                      }}
                      key={`kp${i}`}
                      updateCurve={value => this.updateValue("kp", i, value)}
                      item={item}
                    />
                  );
                })}
              </div>
            </div>
            <div
              style={{
                marginTop: 10,
                display: "flex",
                flexDirection: "column",
                margin: "0 auto"
              }}
            >
              <Typography>
                <FormattedMessage id="pid.ki" />
              </Typography>
              <div style={{ display: "flex" }}>
                {this.state.ki.map((item, i) => {
                  return (
                    <VerticalSliderView
                      labelClassName="tpa-slider-control-label"
                      sliderClassName="tpa-slider-control-slider"
                      style={{ width: 40 }}
                      textInputProps={{
                        className: "tpa-slider-control-input"
                      }}
                      key={`ki${i}`}
                      updateCurve={value => this.updateValue("ki", i, value)}
                      item={item}
                    />
                  );
                })}
              </div>
            </div>
            <div
              style={{
                marginTop: 10,
                display: "flex",
                flexDirection: "column",
                margin: "0 auto"
              }}
            >
              <Typography>
                <FormattedMessage id="pid.kd" />
              </Typography>
              <div style={{ display: "flex" }}>
                {this.state.kd.map((item, i) => {
                  return (
                    <VerticalSliderView
                      labelClassName="tpa-slider-control-label"
                      sliderClassName="tpa-slider-control-slider"
                      style={{ width: 50 }}
                      textInputProps={{
                        className: "tpa-slider-control-input"
                      }}
                      key={`kd${i}`}
                      updateCurve={value => this.updateValue("kd", i, value)}
                      item={item}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
}

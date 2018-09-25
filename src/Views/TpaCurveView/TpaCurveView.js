import React, { Component } from "react";
import TpaCurveItemView from "./TpaCurveItemView";
import FCConnector from "../../utilities/FCConnector";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";

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
    this.notifyDirty = props.notifyDirty;
  }

  updateValue(k, i, state) {
    let updateObj = {};
    updateObj[k] = this.state[k];
    updateObj[k][i].current = state.inputVal;
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
    return FCConnector.sendCommand(
      `tpacurve ${k} ${this.state[k].map(item => item.current).join("=")}`
    );
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
            <Typography variant="headline">TPA Curves</Typography>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <Typography>KP</Typography>

              <div style={{ display: "flex" }}>
                {this.state.kp.map((item, i) => {
                  return (
                    <TpaCurveItemView
                      key={`kp${i}`}
                      updateCurve={state => this.updateValue("kp", i, state)}
                      notifyDirty={this.notifyDirty}
                      item={item}
                    />
                  );
                })}
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <Typography>KI</Typography>
              <div style={{ display: "flex" }}>
                {this.state.ki.map((item, i) => {
                  return (
                    <TpaCurveItemView
                      key={`ki${i}`}
                      updateCurve={state => this.updateValue("ki", i, state)}
                      notifyDirty={this.notifyDirty}
                      item={item}
                    />
                  );
                })}
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <Typography>KD</Typography>
              <div style={{ display: "flex" }}>
                {this.state.kd.map((item, i) => {
                  return (
                    <TpaCurveItemView
                      key={`kd${i}`}
                      updateCurve={state => this.updateValue("kd", i, state)}
                      notifyDirty={this.notifyDirty}
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

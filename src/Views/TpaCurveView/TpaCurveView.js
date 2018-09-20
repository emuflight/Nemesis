import React, { Component } from "react";
// import Slider from "material-ui/Slider";
// import TextField from "material-ui/TextField";
// import FCConnector from "../../utilities/FCConnector";
import TpaCurveItemView from "./TpaCurveItemView";
import FCConnector from "../../utilities/FCConnector";
import RaisedButton from "material-ui/RaisedButton/RaisedButton";

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
    if (!this.state.showCurves) {
      return (
        <div>
          <RaisedButton
            onClick={() => {
              this.setState({ showCurves: true });
            }}
            primary={true}
          >
            Show TPA
          </RaisedButton>
        </div>
      );
    } else {
      return (
        <div>
          <div>
            <RaisedButton
              onClick={() => {
                this.setState({ showCurves: false });
              }}
              primary={true}
            >
              Hide TPA
            </RaisedButton>
          </div>
          <div style={{ margin: "0 auto", width: "720px" }}>
            <h3>TPA Curves</h3>
            <h5>KP</h5>
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
            <h5>KI</h5>
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
            <h5>KD</h5>
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
      );
    }
  }
}

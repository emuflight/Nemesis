import React, { Component } from "react";
import MotorSliderItemView from "./MotorSliderItemView";
import FCConnector from "../../utilities/FCConnector";

const formatMotorItems = array => {
  return array.map((item, i) => {
    return {
      id: "Motor" + (i + 1),
      current: parseInt(item, 1000),
      min: 1000,
      max: 2000,
      step: 1,
      axis: "y",
      element: {
        type: "slider"
      }
    };
  });
};

export default class MotorsSlidersView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      motorSliders: formatMotorItems([0, 1, 2, 3])
    };
  }
  updateValue(motorID, value) {
    console.log(motorID, value);
    return FCConnector.sendCommand(`motor ${motorID} ${value}`); //.then(() => this.props.notifyDirty(true, this.state, value));
  }
  render() {
    return (
      <div>
        <div style={{ display: "flex" }}>
          {this.state.motorSliders.map((item, i) => {
            return (
              <MotorSliderItemView
                key={`motor ${i}`}
                updateMotor={value => this.updateValue(i, value)}
                item={item}
              />
            );
          })}
        </div>
      </div>
    );
  }
}

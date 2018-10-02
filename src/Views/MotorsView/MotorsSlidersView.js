import React, { Component } from "react";
import MotorSliderItemView from "./MotorSliderItemView";
import FCConnector from "../../utilities/FCConnector";

export default class MotorsSlidersView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      motors: []
    };
  }

  componentDidMount() {
    FCConnector.getMotors().then(motorData => {
      console.log(motorData);
      this.setState({
        motors: motorData.filter(v => v > 59390).map((v, i) => {
          return {
            id: "Motor" + (i + 1),
            current: 1000,
            min: 1000,
            max: 2000,
            step: 4,
            axis: "y"
          };
        })
      });
    });
  }
  updateValue(motorID, value) {
    console.log(motorID, value);
    return FCConnector.spinTestMotor(motorID, value); //.then(() => this.props.notifyDirty(true, this.state, value));
  }
  render() {
    return (
      <div>
        <div style={{ display: "flex" }}>
          {this.state.motors.map((item, i) => {
            return (
              <MotorSliderItemView
                key={`motor ${i}`}
                inputDisabled={true}
                updateMotor={value => this.updateValue(i, value)}
                onChange={(e, value) => this.updateValue(i, value)}
                item={item}
              />
            );
          })}
        </div>
      </div>
    );
  }
}

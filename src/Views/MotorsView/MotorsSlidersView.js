import React, { Component } from "react";
import MotorSliderItemView from "./MotorSliderItemView";
import SafetyView from "../SafetyView/SafetyView";
import FCConnector from "../../utilities/FCConnector";

export default class MotorsSlidersView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      motors: []
    };
  }

  componentDidMount() {
    FCConnector.getMotors().then(motorInfo => {
      let maxMotors = motorInfo.indexOf(0);
      maxMotors = maxMotors > -1 ? maxMotors : 8;
      this.setState({
        motors: motorInfo.slice(0, maxMotors).map((v, i) => {
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
  componentWillUnmount() {
    this.state.motors.forEach((motor, i) => FCConnector.spinTestMotor(i, 1000));
  }
  updateValue(motorID, value) {
    return FCConnector.spinTestMotor(motorID, value); //.then(() => this.props.notifyDirty(true, this.state, value));
  }
  render() {
    return (
      <SafetyView>
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
      </SafetyView>
    );
  }
}

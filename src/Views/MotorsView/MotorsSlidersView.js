import React, { Component } from "react";
import MotorSliderItemView from "./MotorSliderItemView";
import SafetyView from "../SafetyView/SafetyView";
import FCConnector from "../../utilities/FCConnector";
import "./MotorSliders.css";

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
        <div
          style={{
            display: "flex",
            flex: 1,
            justifyItems: "center",
            alignItems: "center"
          }}
        >
          {this.state.motors.map((item, i) => {
            return (
              <MotorSliderItemView
                sliderClassName="motor-control-slider"
                labelClassName="motor-control-slider-label"
                style={{ flex: 1 }}
                textInputProps={{
                  style: {
                    width: 60,
                    textAlign: "right"
                  }
                }}
                key={`motor ${i}`}
                inputDisabled={true}
                updateMotor={value => this.updateValue(i + 1, value)}
                onChange={(e, value) => this.updateValue(i + 1, value)}
                item={item}
              />
            );
          })}
        </div>
      </SafetyView>
    );
  }
}

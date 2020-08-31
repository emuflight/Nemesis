import React from "react";
import PickerAssistantView from "./PickerAssistantView";
import MotorItemView from "./MotorItemView";
import Typography from "@material-ui/core/Typography";
import FCConnector from "../../utilities/FCConnector";
import { Button } from "@material-ui/core";
import { FormattedMessage } from "react-intl";
import SafetyView from "../SafetyView/SafetyView";

const motorLayout = [
  { position: "absolute", top: 0, left: 0, padding: 0, margin: 0 },
  { position: "absolute", top: 0, right: 0, padding: 0, margin: 0 },
  { position: "absolute", bottom: 0, right: 0, padding: 0, margin: 0 },
  { position: "absolute", bottom: 0, left: 0, padding: 0, margin: 0 }
];
export default class MotorAssignmentAssistantView extends PickerAssistantView {
  constructor(props) {
    super(props);
    this.state = {
      saving: false,
      spinning: 0,
      isBxF: props.fcConfig.isBxF
    };
  }

  remapMotor = (from, to) => {
    if (from === to) {
      FCConnector.spinTestMotor(from, 1000).then(() => {
        this.setState({ spinning: 0 });
      });
    } else {
      if (!this.props.rebooting) {
        this.setState({ saving: true, spinning: 0 });
        FCConnector.spinTestMotor(from, 1000).then(() => {
          FCConnector.remapMotor(from, to).then(() => {
            this.props.handleSave();
          });
        });
      }
    }
  };
  UNSAFE_componentWillReceiveProps(nextProps) {
    if (this.state.saving && nextProps.rebooting === false) {
      setTimeout(() => {
        this.setState({ saving: false });
      }, 6000);
    }
  }
  get content() {
    let propsReversed =
      this.props.lastChoice && this.props.lastChoice.title === "Reversed";
    return (
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          padding: 30
        }}
      >
        <div style={{ display: "flex" }}>
          <Typography variant="h5">
            <FormattedMessage id="assistant.motors.mapping" />
          </Typography>
          <div style={{ flexGrow: 1 }} />
          <Button
            color="secondary"
            variant="contained"
            style={{ width: 150 }}
            onClick={() => this.props.onFinish()}
          >
            <FormattedMessage id="common.finished" />
          </Button>
        </div>
        <div
          style={{
            padding: 40,
            flex: 1
          }}
        >
          <div
            style={{
              width: "100%",
              height: "100%",
              margin: "0 auto",
              position: "relative",
              backgroundImage: `url("assets/props${
                propsReversed ? "-reversed" : ""
              }.png")`,
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
              backgroundSize: "contain"
            }}
          >
            {this.props.fcConfig &&
              this.props.fcConfig.motor_order.map((num, i) => {
                return (
                  <MotorItemView
                    style={motorLayout[i]}
                    label={`Motor ${num}`}
                    motorIndex={num}
                    spinning={!!this.state.spinning}
                    remapping={this.state.saving}
                    remapMotor={fromMotorIndex => {
                      this.remapMotor(fromMotorIndex, this.state.spinning);
                    }}
                    spinTest={motorIndex => {
                      FCConnector.spinTestMotor(motorIndex, 1100).then(() => {
                        this.setState({ spinning: motorIndex });
                      });
                    }}
                  />
                );
              })}
          </div>
        </div>
      </div>
    );
  }
  render() {
    if (this.props.showPropsWarning) {
      return <SafetyView>{this.content}</SafetyView>;
    } else {
      return this.content;
    }
  }
}

import React from "react";
import PickerAssistantView from "./PickerAssistantView";
import SafetyView from "../SafetyView/SafetyView";
import MotorItemView from "./MotorItemView";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import FCConnector from "../../utilities/FCConnector";
import { FormattedMessage } from "react-intl";

const motorLayout = [
  { position: "absolute", top: 0, left: 0 },
  { position: "absolute", top: 0, right: 0 },
  { position: "absolute", bottom: 0, right: 0 },
  { position: "absolute", bottom: 0, left: 0 }
];
export default class MotorAssignmentAssistantView extends PickerAssistantView {
  constructor(props) {
    super(props);
    this.state = {
      theme: props.theme,
      steps: [{ id: undefined }],
      currentStep: 0,
      progress: 0,
      spinning: 0
    };
  }

  remapMotor = (to, from) => {
    if (!this.state.remapping) {
      this.setState({ remapping: true });
      FCConnector.spinTestMotor(from, 1000).then(() => {
        this.setState({ spinning: 0 });
        FCConnector.remapMotor(to, from).then(() => {
          this.setState({ remapping: false, remapped: true });
        });
      });
    }
  };
  render() {
    return (
      <SafetyView>
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            padding: 30
          }}
        >
          <div style={{ display: "flex" }}>
            <Typography variant="headline">{`Motor mapping`}</Typography>
            <div style={{ flexGrow: 1 }} />
            <Button
              variant="raised"
              color="secondary"
              disabled={!this.state.remapped}
              onClick={() =>
                this.props.handleSave().then(() => {
                  this.setState({ remapped: false });
                  this.props.onFinish();
                })
              }
            >
              <FormattedMessage id="common.save" />
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
                width: 550,
                height: 450,
                margin: "0 auto",
                position: "relative",
                backgroundImage: `url("${this.props.lastChoice.image}")`,
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat"
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
                      remapping={this.state.remapping}
                      remapMotor={m => {
                        this.remapMotor(this.state.spinning, m);
                      }}
                      spinTest={value => {
                        console.log(value);
                        this.setState({ spinning: value });
                        FCConnector.spinTestMotor(value, 1060);
                      }}
                    />
                  );
                })}
            </div>
          </div>
        </div>
      </SafetyView>
    );
  }
}

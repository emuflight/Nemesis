import React from "react";
import PickerAssistantView from "./PickerAssistantView";
import MotorItemView from "./MotorItemView";
import Typography from "@material-ui/core/Typography";
import FCConnector from "../../utilities/FCConnector";
import { Button } from "@material-ui/core";
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
      saving: false,
      spinning: 0
    };
  }

  remapMotor = (from, to) => {
    if (from === to) {
      FCConnector.spinTestMotor(from, 1000).then(() => {
        this.setState({ spinning: 0 });
      });
    } else {
      if (!this.props.rebooting) {
        FCConnector.spinTestMotor(from, 1000).then(() => {
          this.setState({ saving: true, spinning: 0 });
          FCConnector.remapMotor(from, to).then(() => {
            this.props.handleSave();
          });
        });
      }
    }
  };
  componentWillReceiveProps(nextProps) {
    if (this.state.saving && nextProps.rebooting === false) {
      setTimeout(() => {
        this.setState({ saving: false });
      }, 3000);
    }
  }
  render() {
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
          <Typography variant="headline">
            <FormattedMessage id="assistant.motors.mapping" />
          </Typography>
          <div style={{ flexGrow: 1 }} />
          <Button
            color="secondary"
            variant="raised"
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
                    remapping={this.state.saving}
                    remapMotor={fromMotorIndex => {
                      this.remapMotor(fromMotorIndex, this.state.spinning);
                    }}
                    spinTest={motorIndex => {
                      console.log(motorIndex);
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
}

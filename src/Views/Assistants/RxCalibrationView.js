import React, { Component } from "react";
import FCConnector from "../../utilities/FCConnector";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import LinearProgress from "@material-ui/core/LinearProgress";
import List from "@material-ui/core/List";
import { FormattedMessage } from "react-intl";
import "./RxCalibrationView.css";

export default class RxCalibrationView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      step: 1,
      channelSubStep: 0,
      telemetry: {},
      stepMessage: "assistant.rx.center-sticks"
    };
  }

  normalize(value) {
    return (
      ((value - this.state.scaleMin) * 100) /
      (this.state.scaleMax - this.state.scaleMin)
    );
  }

  begin() {
    this.setState({ step: 2 });
    FCConnector.sendCliCommand("wiz rc1").then(message => {
      this.setState({ stepMessage: message });
    });
  }

  handleNextStep() {
    if (this.state.step > 5) {
      this.props.onFinish();
    }
    if (this.state.step === 0) {
      return this.begin();
    }

    this.setState({ busy: true });
    FCConnector.stopTelemetry();
    FCConnector.sendCliCommand(`wiz rc${this.state.step}`).then(resp => {
      FCConnector.startTelemetry("rx");
      if (this.state.step === 2) {
        this.setState({
          step: 3
        });
        this.interval = setInterval(() => {
          FCConnector.sendCliCommand(`wiz rc3`).then(message => {
            if (message !== this.state.stepMessage) {
              this.setState({
                channelSubStep: this.state.channelSubStep + 1,
                busy: false,
                stepMessage: message
              });
            }
            if (this.state.channelSubStep > 5) {
              clearInterval(this.interval);
              this.setState({
                step: 4,
                busy: false,
                stepMessage: message
              });
            }
          });
        }, 250);
      } else {
        this.setState({
          step: this.state.step + 1,
          busy: false,
          stepMessage: resp
        });
      }
    });
  }

  handleRXData = message => {
    try {
      let { rx } = JSON.parse(message.data);
      if (rx) {
        this.setState({
          scaleMin: rx.min,
          scaleMax: rx.max,
          channels: rx.channels.slice(0, 8)
        });
      }
    } catch (ex) {
      console.warn("unable to parse telemetry", ex);
    }
  };

  componentDidMount() {
    FCConnector.webSockets.addEventListener("message", this.handleRXData);
    FCConnector.startTelemetry("rx");
  }

  componentWillUnmount = () => {
    clearInterval(this.interval);
    FCConnector.stopTelemetry();
    FCConnector.webSockets.removeEventListener("message", this.handleRXData);
  };

  render() {
    return (
      <div>
        <div>
          <Typography variant="h5">
            <FormattedMessage id={this.state.stepMessage} />
          </Typography>
          {this.state.step !== 3 && (
            <Button
              variant="contained"
              color="secondary"
              onClick={() => {
                this.handleNextStep();
              }}
            >
              <FormattedMessage id="common.next" />
            </Button>
          )}
        </div>
        {this.state.step < 4 && (
          <div
            className={`rx_assistant_step_${this.state.step}_${
              this.state.channelSubStep
            }`}
          />
        )}

        <List>
          {this.state.step > 3 &&
            this.state.channels &&
            this.state.channels.map((channel, i) => {
              return (
                <div key={i} style={{ position: "relative" }}>
                  <Typography
                    variant="caption"
                    style={{
                      position: "absolute",
                      top: 0,
                      right: 0,
                      bottom: 0,
                      left: 0,
                      textAlign: "center"
                    }}
                  >
                    {channel}
                  </Typography>
                  <Typography variant="caption">
                    <FormattedMessage
                      id="rx.channel.label"
                      values={{ label: `Channel: ${i + 1}` }}
                    />
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    style={{ height: 20, margin: 10 }}
                    value={this.normalize(channel)}
                  />
                </div>
              );
            })}
        </List>
      </div>
    );
  }
}

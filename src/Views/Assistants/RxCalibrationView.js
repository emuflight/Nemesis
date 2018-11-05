import React, { Component } from "react";
import FCConnector from "../../utilities/FCConnector";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import LinearProgress from "@material-ui/core/LinearProgress";
import List from "@material-ui/core/List";
import { FormattedMessage } from "react-intl";

const rxAssistantImages = {
  "1": "assets/receiver_on.jpg"
};
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
  cleanupMessage(message) {
    return message.replace("#wiz ", "").slice(0, message.length);
  }
  begin() {
    this.setState({ step: 2 });
    FCConnector.sendCliCommand("wiz rc1").then(message => {
      this.setState({ stepMessage: this.cleanupMessage(message) });
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
    FCConnector.sendCliCommand(`wiz rc${this.state.step}`).then(message => {
      FCConnector.startTelemetry("rx");
      let cleanMessage = this.cleanupMessage(message);
      if (this.state.step === 3 && this.state.channelSubStep < 3) {
        this.setState({
          channelSubStep: this.state.channelSubStep + 1,
          busy: false,
          stepMessage: cleanMessage
        });
      } else {
        this.setState({
          step: this.state.step + 1,
          busy: false,
          stepMessage: cleanMessage
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
          <Button
            variant="contained"
            color="secondary"
            onClick={() => {
              this.handleNextStep();
            }}
          >
            <FormattedMessage id="common.next" />
          </Button>
        </div>
        <List>
          {this.state.channels &&
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

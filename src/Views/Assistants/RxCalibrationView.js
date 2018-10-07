import React, { Component } from "react";
import FCConnector from "../../utilities/FCConnector";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import LinearProgress from "@material-ui/core/LinearProgress";
import List from "@material-ui/core/List";
import { FormattedMessage } from "react-intl";

export default class RxCalibrationView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      scale: 2000,
      step: 1,
      channelSubStep: 0,
      telemetry: {},
      stepMessage: "assistant.rx.center-sticks"
    };
  }

  normalize(value) {
    return (value * 100) / this.state.scale;
  }
  cleanupMessage(message) {
    return message
      .replace("#wiz ", "")
      .slice(0, message.toLowerCase().indexOf("then") - 4);
  }
  begin() {
    this.setState({ step: 2 });
    FCConnector.sendCliCommand("wiz rc1").then(message => {
      this.setState({ stepMessage: this.cleanupMessage(message) });
      this.wizInterval = setInterval(() => {
        FCConnector.sendCliCommand("wiz rc1");
      }, 400);
    });
  }

  handleNextStep() {
    if (this.state.step > 5) {
      this.props.handleNextStep();
    }
    if (this.state.step === 0) {
      return this.begin();
    }

    clearInterval(this.wizInterval);

    this.setState({ busy: true });
    FCConnector.pauseTelemetry();
    FCConnector.sendCliCommand(`wiz rc${this.state.step}`).then(message => {
      FCConnector.resumeTelemetry();
      let cleanMessage = this.cleanupMessage(message);
      if (this.state.step === 3 && this.state.channelSubStep < 4) {
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
      let telemetry = JSON.parse(message.data);
      if (telemetry.type === "rx") {
        console.log(telemetry);
        this.setState({ channels: telemetry.channels.slice(0, 6) });
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
          <Typography variant="headline">
            <FormattedMessage id={this.state.stepMessage} />
          </Typography>
          <Button
            variant="raised"
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
                      id="rx.channel.number"
                      values={{ number: i + 1 }}
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

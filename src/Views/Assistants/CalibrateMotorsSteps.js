import React, { Component } from "react";
import FCConnector from "../../utilities/FCConnector";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import { FormattedMessage } from "react-intl";

export default class CalibrateMotorsSteps extends Component {
  constructor(props) {
    super(props);
    this.state = {
      telemetry: {},
      throttleUp: false
    };
  }

  handleVbatData = message => {
    try {
      let telemetry = JSON.parse(message.data);
      if (telemetry.type === "vbat") {
        this.setState({ telemetry });
      }
    } catch (ex) {
      console.warn("unable to parse telemetry", ex);
    }
  };

  componentDidMount() {
    FCConnector.webSockets.addEventListener("message", this.handleVbatData);
    FCConnector.startTelemetry("vbat");
  }

  componentWillUnmount = () => {
    FCConnector.webSockets.removeEventListener("message", this.handleVbatData);
    FCConnector.stopTelemetry();
  };

  nextCommand(command) {
    FCConnector.stopTelemetry();

    return FCConnector.sendCliCommand(command).then(() => {
      this.setState({ throttleUp: true });
      FCConnector.startTelemetry("vbat");
    });
  }

  render() {
    if (this.state.calibrated) {
      return (
        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          <Typography variant="h5">
            <FormattedMessage id="assistant.motors.calibration.complete" />
          </Typography>
          <Button
            color="secondary"
            variant="contained"
            onClick={() => this.props.onFinish(this.props.lastChoice)}
          >
            <FormattedMessage id="common.next" />
          </Button>
        </div>
      );
    } else if (this.state.telemetry.volts > 3 && !this.state.throttleUp) {
      return (
        <div style={{ flex: 1, display: "flex" }}>
          <Typography variant="h5">
            <FormattedMessage
              id="assistant.motors.calibration.unplug"
              values={{ volts: this.state.telemetry.volts }}
            />
          </Typography>
        </div>
      );
    } else if (this.state.telemetry.volts < 3 && !this.state.throttleUp) {
      return (
        <div>
          <Typography variant="h5">
            <FormattedMessage id="assistant.motors.calibration.confirm.unplugged" />
          </Typography>
          <Button
            color="secondary"
            variant="contained"
            onClick={() => {
              let command = "motor 255 2000";
              this.nextCommand(command);
            }}
          >
            <FormattedMessage id="common.next" />
          </Button>
        </div>
      );
    } else if (this.state.telemetry.volts > 3 && this.state.throttleUp) {
      return (
        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          <Typography variant="h5">
            <FormattedMessage id="assistant.motors.calibration.throttleup" />
          </Typography>
          <Button
            color="secondary"
            variant="contained"
            onClick={() => {
              let command = "motor 255 1000";
              this.nextCommand(command).then(() => {
                this.setState({ calibrated: true });
              });
            }}
          >
            <FormattedMessage id="common.next" />
          </Button>
        </div>
      );
    } else {
      return (
        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          <Typography variant="h5">
            <FormattedMessage
              id="assistant.motors.calibration.plugin"
              values={{ volts: this.state.telemetry.volts }}
            />
          </Typography>
        </div>
      );
    }
  }
}

import React, { Component } from "react";
import Button from "@material-ui/core/Button";
import FCConnector from "../../utilities/FCConnector";
import ConfigListView from "../ConfigListView/ConfigListView";
import Paper from "@material-ui/core/Paper";
import theme from "../../Themes/Dark";
import RXTelemView from "./RXTelemView";

export default class RXView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showRXTelem: false
    };
  }

  componentDidMount() {
    FCConnector.webSockets.addEventListener("message", message => {
      try {
        let telemetry = JSON.parse(message.data);
        if (telemetry.type === "rx") {
          this.setState({ telemetry: telemetry.channels });
        }
      } catch (ex) {
        console.warn("unable to parse telemetry", ex);
      }
    });
    FCConnector.startTelemetry("rx");
  }

  componentWillUnmount() {
    FCConnector.stopTelemetry();
  }
  render() {
    return (
      <div>
        <Paper
          theme={theme}
          elevation={3}
          style={{ margin: "10px", padding: "10px" }}
        >
          <div>
            <Button
              onClick={() =>
                this.setState({ showRXTelem: !this.state.showRXTelem })
              }
              variant="raised"
              color="primary"
            >{`${this.state.showRXTelem ? "Hide" : "Show"} RX Data`}</Button>
          </div>
          {this.state.showRXTelem && <RXTelemView />}
        </Paper>
        <Paper
          theme={theme}
          elevation={3}
          style={{ margin: "10px", padding: "10px" }}
        >
          <ConfigListView
            notifyDirty={this.props.notifyDirty}
            items={this.props.items}
          />
        </Paper>
      </div>
    );
  }
}

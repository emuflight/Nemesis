import React, { Component } from "react";
import List from "@material-ui/core/List";
import FCConnector from "../../utilities/FCConnector";
import ConfigListView from "../ConfigListView/ConfigListView";
import Paper from "@material-ui/core/Paper";
import theme from "../../Themes/Dark";
import LinearProgress from "@material-ui/core/LinearProgress";
import Typography from "@material-ui/core/Typography";

const normalise = value => ((value - 0) * 100) / (3000 - 0);
export default class RXView extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    FCConnector.webSockets.addEventListener("message", message => {
      try {
        let telemetry = JSON.parse(message.data);
        if (telemetry.telemetry) {
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
          <List>
            {this.state.telemetry &&
              this.state.telemetry.map((v, i) => {
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
                      {v}
                    </Typography>
                    <Typography variant="caption">Channel {i + 1}:</Typography>
                    <LinearProgress
                      variant="determinate"
                      style={{ height: 20, margin: 10 }}
                      value={normalise(v)}
                    />
                  </div>
                );
              })}
          </List>
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

import React, { Component } from "react";
import CircularProgress from "@material-ui/core/CircularProgress";
import List from "@material-ui/core/List";
import Typography from "@material-ui/core/Typography";
import FCConnector from "../utilities/FCConnector";
import TelemetryView from "./TelemetryView";
import TextField from "@material-ui/core/TextField";
import { FormattedMessage } from "react-intl";

// const calculatePercentComplete = fcConfig => {};
export default class InfoBarView extends Component {
  constructor(props) {
    super(props);
    this.handleDrawerToggle = props.handleDrawerToggle;
    this.state = {
      setupCompleted: -1,
      craftName: props.fcConfig.craftName,
      telemetry: {
        cpu: 0
      }
    };
  }
  updateCraftName = () => {
    if (this.props.fcConfig.craftName !== this.state.craftName) {
      FCConnector.sendCommand(`name ${this.state.craftName || "-"}`).then(
        () => {
          this.props.notifyDirty(true, this.state, this.state.craftName);
        }
      );
    }
  };

  get setupPercentLabel() {
    const complete = "complete";
    if (this.state.setupCompleted >= 100) {
      return complete;
    }
    return `${this.state.setupCompleted}% ${complete}`;
  }
  handleStatus = message => {
    try {
      let telemetry = JSON.parse(message.data);
      if (telemetry.type === "status") {
        console.log(telemetry);
        this.setState({ telemetry });
      }
    } catch (ex) {
      console.warn("unable to parse telemetry", ex);
    }
  };
  componentDidMount() {
    if (this.props.fcConfig.isBxF) {
      FCConnector.webSockets.addEventListener("message", this.handleStatus);
    }
  }
  componentWillUnmount() {
    if (this.props.fcConfig.isBxF) {
      FCConnector.webSockets.removeEventListener("message", this.handleStatus);
    }
  }
  render() {
    return (
      <List
        style={{
          marginLeft: "20px",
          display: "flex",
          padding: "10px"
        }}
      >
        <div
          style={{
            display: "flex",
            flex: "1",
            marginBottom: "10px",
            justifyItems: "center",
            alignItems: "center"
          }}
        >
          <Typography
            style={{
              position: "relative",
              margin: "0 10px",
              whiteSpace: "nowrap"
            }}
          >
            <FormattedMessage id="info.connected-to" />
          </Typography>
          <TextField
            id="craft_name"
            style={{ color: "grey" }}
            placeholder="A craft has no name..."
            defaultValue={this.props.fcConfig.name}
            onBlur={() => this.updateCraftName()}
            onChange={event => this.setState({ craftName: event.target.value })}
          />
          <TelemetryView
            style={{ flexGrow: 1 }}
            rebooting={this.props.rebooting}
          />
          {this.props.fcConfig.isBxF && (
            <Typography>
              <FormattedMessage
                id="info.cpu-load"
                values={{ percent: this.state.telemetry.cpu }}
              />
            </Typography>
          )}
          {this.state.setupCompleted > -1 && (
            <List
              style={{ cursor: "pointer" }}
              onClick={() => this.handleDrawerToggle()}
            >
              <CircularProgress
                mode="determinate"
                value={this.state.setupCompleted}
                size={35}
                thickness={8}
              />
              <List
                style={{ position: "relative", bottom: "15px", left: "3px" }}
              >
                {this.setupPercentLabel}
              </List>
            </List>
          )}
        </div>
      </List>
    );
  }
}

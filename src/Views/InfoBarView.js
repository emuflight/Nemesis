import React, { Component } from "react";
import CircularProgress from "@material-ui/core/CircularProgress";
import List from "@material-ui/core/List";
import Typography from "@material-ui/core/Typography";
import FCConnector from "../utilities/FCConnector";
import TextField from "@material-ui/core/TextField";
import { FormattedMessage } from "react-intl";

// const calculatePercentComplete = fcConfig => {};
export default class InfoBarView extends Component {
  constructor(props) {
    super(props);
    this.craftName = props.fcConfig.name;
    this.handleDrawerToggle = props.handleDrawerToggle;
    this.state = {
      setupCompleted: -1,
      craftName: this.craftName,
      telemetry: {
        cpu: undefined
      }
    };
  }
  updateCraftName = () => {
    if (this.craftName !== this.state.craftName) {
      let command = `name ${this.state.craftName || "-"}`;
      FCConnector.sendCliCommand(command).then(() => {
        this.props.notifyDirty(true, this.state, this.state.craftName);
      });
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
        this.setState({ telemetry });
      }
    } catch (ex) {
      console.warn("unable to parse telemetry", ex);
    }
  };
  componentDidMount() {
    FCConnector.webSockets.addEventListener("message", this.handleStatus);
  }
  componentWillUnmount() {
    FCConnector.webSockets.removeEventListener("message", this.handleStatus);
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
            defaultValue={this.state.craftName}
            onBlur={() => this.updateCraftName()}
            onChange={event => this.setState({ craftName: event.target.value })}
          />
          {this.state.telemetry.cpu !== undefined && (
            <Typography
              className={
                this.state.telemetry.cpu > 49
                  ? this.state.telemetry.cpu > 59
                    ? "danger"
                    : "warning"
                  : "nominal"
              }
            >
              <FormattedMessage
                id="info.cpu-load"
                values={{ percent: this.state.telemetry.cpu }}
              />
            </Typography>
          )}
          {this.state.telemetry.loop && (
            <Typography>
              ,&nbsp;
              <FormattedMessage
                id="info.loop-time"
                values={{ time: this.state.telemetry.loop }}
              />
              &micro;s
            </Typography>
          )}
          {this.state.telemetry.khz && (
            <Typography>
              ,&nbsp;
              <FormattedMessage
                id="info.loop-speed"
                values={{ khz: this.state.telemetry.khz }}
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

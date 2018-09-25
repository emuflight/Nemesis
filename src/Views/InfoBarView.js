import React, { Component } from "react";
import CircularProgress from "@material-ui/core/CircularProgress";
import List from "@material-ui/core/List";
import FCConnector from "../utilities/FCConnector";
import TelemetryView from "./TelemetryView";
import TextField from "@material-ui/core/TextField";

// const calculatePercentComplete = fcConfig => {};
export default class InfoBarView extends Component {
  constructor(props) {
    super(props);
    this.handleDrawerToggle = props.handleDrawerToggle;
    this.notifyDirty = props.notifyDirty;
    this.state = {
      setupCompleted: -1,
      craftName: props.fcConfig.craftName,
      isDirty: props.isDirty
    };
  }
  updateCraftName = () => {
    this.notifyDirty(true, this.state, this.state.craftName);
    this.setState({ namingCraft: true });
    FCConnector.sendCommand(`name ${this.state.craftName || "-"}`).then(() => {
      this.setState({ namingCraft: false });
    });
  };

  get setupPercentLabel() {
    const complete = "complete";
    if (this.state.setupCompleted >= 100) {
      return complete;
    }
    return `${this.state.setupCompleted}% ${complete}`;
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
        <div style={{ display: "flex", flex: "1", marginBottom: "10px" }}>
          <h4 style={{ position: "relative", margin: "0 10px", top: "15px" }}>
            Connected to:
          </h4>
          <TextField
            id="craft_name"
            placeholder="A craft has no name..."
            defaultValue={this.props.fcConfig.name}
            onBlur={() => this.updateCraftName()}
            onChange={(event, newValue) =>
              this.setState({ craftName: newValue })
            }
          />
          <TelemetryView />
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

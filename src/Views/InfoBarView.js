import React, { Component } from "react";
import CircularProgress from "material-ui/CircularProgress";
import List from "material-ui/List";
import FCConnector from "../utilities/FCConnector";
import TelemetryView from "./TelemetryView";
import { RaisedButton, TextField } from "material-ui";

// const calculatePercentComplete = fcConfig => {};
export default class InfoBarView extends Component {
  constructor(props) {
    super(props);
    this.handleDrawerToggle = props.handleDrawerToggle;
    this.fcConfig = props.fcConfig;
    this.state = {
      setupCompleted: -1,
      craftName: props.fcConfig.craftName,
      isDirty: props.isDirty
    };
  }
  updateCraftName() {
    this.setState({ namingCraft: true });
    FCConnector.sendCommand(`name ${this.state.craftName}`).then(() => {
      this.setState({ namingCraft: false });
    });
  }

  handleSaveClick = () => {
    FCConnector.saveConfig();
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
          display: "flex",
          flexDirection: "row-reverse",
          padding: "10px"
        }}
      >
        <RaisedButton
          label="Save"
          style={{ marginLeft: "10px" }}
          primary={true}
          disabled={!this.props.isDirty}
          onClick={() => this.handleSaveClick()}
        />
        <div style={{ display: "flex", flex: "1", marginBottom: "10px" }}>
          <h4 style={{ position: "relative", margin: "0 10px", top: "15px" }}>
            Connected to:
          </h4>
          <TextField
            id="craft_name"
            placeholder="A craft has no name..."
            defaultValue={this.state.craftName}
            errorText={this.state.namingCraft && "Saving..."}
            errorStyle={{ color: "rgb(0, 188, 212)" }}
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

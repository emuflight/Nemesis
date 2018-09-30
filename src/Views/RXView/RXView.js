import React, { Component } from "react";
import Button from "@material-ui/core/Button";
import ConfigListView from "../ConfigListView/ConfigListView";
import Paper from "@material-ui/core/Paper";
import theme from "../../Themes/Dark";
import RXTelemView from "./RXTelemView";
import ChannelMapView from "./ChannelMapView";

export default class RXView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showRXTelem: false
    };
  }
  render() {
    return (
      <div>
        <Paper
          theme={theme}
          elevation={3}
          style={{ margin: "10px", padding: "10px" }}
        >
          <div style={{ display: "flex" }}>
            <Button
              onClick={() =>
                this.setState({ showRXTelem: !this.state.showRXTelem })
              }
              variant="raised"
              color="primary"
            >{`${this.state.showRXTelem ? "Hide" : "Show"} RX Data`}</Button>
            <div style={{ flexGrow: 1 }} />
            <ChannelMapView
              openAssistant={this.props.openAssistant}
              notifyDirty={this.props.notifyDirty}
            />
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

import React, { Component } from "react";
import Button from "@material-ui/core/Button";
import ConfigListView from "../ConfigListView/ConfigListView";
import Paper from "@material-ui/core/Paper";
import RXTelemView from "./RXTelemView";
import ChannelMapView from "./ChannelMapView";
import { FormattedMessage } from "react-intl";

export default class RXView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      theme: props.theme,
      showRXTelem: false
    };
  }
  render() {
    return (
      <div>
        <Paper theme={this.state.theme} elevation={3}>
          <div style={{ display: "flex" }}>
            <Button
              onClick={() =>
                this.setState({ showRXTelem: !this.state.showRXTelem })
              }
              variant="raised"
              color="primary"
            >
              <FormattedMessage
                id="rx.hide-show"
                values={{ hideShow: this.state.showRXTelem ? "Hide" : "Show" }}
              />
            </Button>
            <Button
              style={{ marginLeft: 20 }}
              color="secondary"
              variant="raised"
              onClick={() => this.props.openAssistant("rx")}
            >
              <FormattedMessage id="assistant.rx" />
            </Button>
            <div style={{ flexGrow: 1 }} />
            <ChannelMapView
              mapping={this.props.fcConfig.channel_map}
              openAssistant={this.props.openAssistant}
              notifyDirty={this.props.notifyDirty}
            />
          </div>
          {this.state.showRXTelem && (
            <RXTelemView scale={this.props.fcConfig.rx_scale} />
          )}
        </Paper>
        <Paper theme={this.state.theme} elevation={3}>
          <ConfigListView
            notifyDirty={this.props.notifyDirty}
            items={this.props.items}
          />
        </Paper>
      </div>
    );
  }
}

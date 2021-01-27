import React, { Component } from "react";
import Button from "@material-ui/core/Button";
import ConfigListView from "../ConfigListView/ConfigListView";
import Paper from "@material-ui/core/Paper";
import RXTelemView from "./RXTelemView";
import RXStickView from "./RXStickView";
import ChannelMapView from "./ChannelMapView";
import FCConnector from "../../utilities/FCConnector";
import { FormattedMessage } from "react-intl";

export default class RXView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      theme: props.theme,
      mapping: this.props.fcConfig.channel_map
    };
  }

  componentDidMount() {
    if (!this.props.fcConfig.channel_map) {
      return FCConnector.getChannelMap().then(mapping => {
        this.props.fcConfig.channel_map = mapping;
        this.refs.channelMap.setState({ mapping });
        this.setState({ mapping: mapping });
      });
    } else {
      this.refs.channelMap.setState({
        mapping: this.props.fcConfig.channel_map
      });
    }
    this.setState({
      mapping: "AERT1234"
    });
  }

  render() {
    return (
      <div>
        <Paper>
          <div style={{ display: "flex" }}>
            <Button
              style={{ marginLeft: 20 }}
              color="secondary"
              variant="contained"
              onClick={() => this.props.openAssistant("rx")}
            >
              <FormattedMessage id="assistant.rx" />
            </Button>
            <div style={{ flexGrow: 1 }} />
            <ChannelMapView
              ref="channelMap"
              mapping={this.props.fcConfig.channel_map}
              openAssistant={this.props.openAssistant}
              notifyDirty={this.props.notifyDirty}
            />
          </div>
          {this.state.mapping && (
            <RXStickView
              scale={this.props.fcConfig.rx_scale}
              channelMap={this.props.fcConfig.channel_map}
            />
          )}
          {this.state.mapping && (
            <RXTelemView
              scale={this.props.fcConfig.rx_scale}
              channelMap={this.props.fcConfig.channel_map}
            />
          )}
        </Paper>
        <Paper>
          <ConfigListView
            fcConfig={this.props.fcConfig}
            features={this.props.features}
            notifyDirty={this.props.notifyDirty}
            items={this.props.items}
          />
        </Paper>
      </div>
    );
  }
}

import React, { Component } from "react";
import List from "@material-ui/core/List";
import AuxChannelItemView from "./AuxChannelItemView";
import Paper from "@material-ui/core/Paper";
import FCConnector from "../../utilities/FCConnector";
import { FormattedMessage } from "react-intl";
import Typography from "@material-ui/core/Typography";
// <AuxChannelView
// fcConfig={mergedProfile}
// auxScale={mergedProfile.rx_scale}
// auxModeList={mergedProfile.aux_channel_modes}
// modes={mergedProfile.modes && mergedProfile.modes.values}
// notifyDirty={(isDirty, item, newValue) =>
//   this.notifyDirty(isDirty, item, newValue)
// }
// />

export default class NewAuxChannelView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      channels: []
    };
  }

  handleRXData = message => {
    try {
      let { rx } = JSON.parse(message.data);
      if (rx) {
        this.setState({ channels: rx.channels });
      }
    } catch (ex) {
      console.warn("unable to parse telemetry", ex);
    }
  };

  componentDidMount() {
    if (!this.state.modes) {
      FCConnector.getModes().then(modes => {
        this.setState({ modes: modes });
      });
    }
    FCConnector.webSockets.addEventListener("message", this.handleRXData);
    FCConnector.startTelemetry("rx");
  }

  componentWillUnmount() {
    FCConnector.webSockets.removeEventListener("message", this.handleRXData);
    FCConnector.stopFastTelemetry();
  }

  render() {
    return (
      <List>
        {this.props.auxModeList &&
          this.props.auxModeList.map((mode, i) => {
            return (
              <Typography style={{ marginBottom: 12 }} color="textSecondary">
                <FormattedMessage
                  id={mode.label}
                  //values={{ version: this.props.appVersion }}
                />
              </Typography>
            );
          })}
      </List>
    );
  }
}

import React, { Component } from "react";
import FCConnector from "../../utilities/FCConnector";
import ConfigListView from "../ConfigListView/ConfigListView";
import Paper from "@material-ui/core/Paper";
import LinearProgress from "@material-ui/core/LinearProgress";
import Typography from "@material-ui/core/Typography";
import { Button } from "@material-ui/core";
import { FormattedMessage } from "react-intl";

export default class BlackBoxView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      theme: props.theme,
      storageInfo: {
        totalSize: 1,
        usedSize: 0
      }
    };
  }
  componentDidMount() {
    FCConnector.storage().then(storageInfo => {
      console.log(storageInfo);
      this.setState({ storageInfo });
    });
  }
  render() {
    let normalizedPercent =
      ((this.state.storageInfo.usedSize - 0) * 100) /
      (this.state.storageInfo.totalSize - 0);
    return (
      <div>
        <Paper
          theme={this.state.theme}
          elevation={3}
          style={{ margin: "10px", padding: "10px" }}
        >
          <div style={{ position: "relative" }}>
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
              {this.state.storageInfo.usedSize}/
              {this.state.storageInfo.totalSize}
            </Typography>
            <Typography variant="caption">
              <FormattedMessage
                id="blackbox.flash-used"
                values={{ percent: normalizedPercent }}
              />
            </Typography>
            <LinearProgress
              variant="determinate"
              style={{ height: 20, margin: 10 }}
              value={normalizedPercent}
            />
            <br />
            <Button
              onClick={() => FCConnector.sendCommand("msc")}
              variant="raised"
              color="secondary"
            >
              <FormattedMessage id="blackbox.load-drive" />
            </Button>
          </div>
        </Paper>
        <Paper
          theme={this.state.theme}
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

import React, { Component } from "react";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import Typography from "@material-ui/core/Typography";
import Avatar from "@material-ui/core/Avatar";
import Paper from "@material-ui/core/Paper";
import CircularProgress from "@material-ui/core/CircularProgress";
import CliView from "./CliView/CliView";
import { FormattedMessage, FormattedHTMLMessage } from "react-intl";

export default class Disconnected extends Component {
  constructor(props) {
    super(props);
    this.state = {
      theme: props.theme
    };
  }
  render() {
    let device = this.props.device;
    let openCli = !!(device && device.incompatible);
    return (
      <Paper
        className="flex-column"
        style={{
          position: "relative",
          flex: "1",
          minHeight: "100%",
          boxSizing: "border-box"
        }}
      >
        <Card>
          <CardContent>
            <Avatar
              title={`v${this.props.appVersion}`}
              src="assets/icon.png"
              style={{ width: 60, height: 60 }}
              onClick={() => localStorage.clear()}
            />
            <Typography style={{ marginBottom: 12 }} color="textSecondary">
              <FormattedMessage
                id="disconnected.title"
                values={{ version: this.props.appVersion }}
              />
            </Typography>
            <Typography variant="h5" component="h2">
              <FormattedMessage id="disconnected.headline" />
            </Typography>
            <Typography component="p">
              <FormattedMessage
                id={
                  openCli
                    ? "disconnected.incompatible"
                    : "disconnected.autodetect"
                }
              />
              <br />
            </Typography>
          </CardContent>
          <CardContent>
            {this.props.connecting && (
              <div
                style={{
                  justifyContent: "center",
                  display: "flex",
                  padding: "20px"
                }}
              >
                <CircularProgress size={80} thickness={5} />
              </div>
            )}
            {openCli && (
              <CliView
                open={openCli}
                startText={
                  (
                    <FormattedHTMLMessage
                      id="disconnected.cli.incompatible"
                      values={{ error: device.error }}
                    />
                  ).innerHTML
                }
                stayOpen={openCli}
                ref="cliView"
              />
            )}
          </CardContent>
        </Card>
      </Paper>
    );
  }
}

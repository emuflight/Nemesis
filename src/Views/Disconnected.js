import React from "react";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import Typography from "@material-ui/core/Typography";
import Avatar from "@material-ui/core/Avatar";
import Paper from "@material-ui/core/Paper";
import CircularProgress from "@material-ui/core/CircularProgress";
import CliView from "./CliView/CliView";
import theme from "../Themes/Dark";

export default class Disconnected extends React.Component {
  render() {
    let device = this.props.device;
    let openCli = device && device.error;
    return (
      <Paper
        theme={theme}
        elevation={3}
        style={{
          display: "flex",
          flexDirection: "column",
          position: "relative",
          flex: "1",
          padding: "10px",
          minHeight: "100%",
          boxSizing: "border-box"
        }}
      >
        <Card>
          <CardContent>
            <Avatar
              alt="Helio RC, LLL"
              src="/android-chrome-192x192.png"
              style={{ width: 60, height: 60 }}
              onClick={() => localStorage.clear()}
            />
            <Typography style={{ marginBottom: 12 }} color="textSecondary">
              Pegasus multi-firmware UI
            </Typography>
            <Typography variant="headline" component="h2">
              Please connect a compatible FC
            </Typography>
            <Typography component="p">
              {!openCli
                ? "We will automatically detect it..."
                : "Incompatible device, there be dragons ahead..."}
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
                open={!!openCli}
                startText={device.error}
                stayOpen={!!openCli}
                ref="cliView"
              />
            )}
          </CardContent>
        </Card>
      </Paper>
    );
  }
}

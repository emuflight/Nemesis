import React from "react";
import { Card, CardHeader, CardTitle } from "material-ui/Card";
import Paper from "material-ui/Paper";
import CircularProgress from "material-ui/CircularProgress";
import CliView from "./CliView/CliView";

export default class Disconnected extends React.Component {
  render() {
    let device = this.props.device;
    let openCli = device && device.error;
    return (
      <Paper
        zDepth={3}
        style={{
          display: "flex",
          flexDirection: "column",
          position: "relative",
          flex: "1",
          padding: "10px",
          minHeight: "100%"
        }}
      >
        <Card>
          <CardHeader
            title="Pegasus multi-firmware UI"
            subtitle="by Helio RC, LLC"
            avatar="/android-chrome-192x192.png"
          />
          <CardTitle
            title="Please connect a compatible FC"
            subtitle={
              !openCli
                ? "We will automatically detect it..."
                : "Incompatible device, there be dragons ahead..."
            }
          />
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
              startText={device.error}
              stayOpen={!!openCli}
              ref="cliView"
            />
          )}
        </Card>
      </Paper>
    );
  }
}

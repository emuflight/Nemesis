import React, { Component } from "react";
import Paper from "@material-ui/core/Paper";
import ConfigListView from "./ConfigListView/ConfigListView";
import FCConnector from "../utilities/FCConnector";
import AssistantView from "./Assistants/AssistantView";
import "./Connected.css";
import { FCConfigContext } from "../App";
import ResponsiveDrawerView from "./ResponsiveDrawerView";
import Typography from "@material-ui/core/Typography";

export default class DFUErrorView extends Component {
  constructor(props) {
    super(props);
  }
  render() {
    return (
      <Paper>
        <div>
          <Typography variant="h5">DFU mode detected</Typography>
        </div>
        <div>
          <p>
            <Typography variant="h6">
              The flight controller you connected is in DFU mode. Please unplug
              and re-plug in the FC to disable DFU mode.
            </Typography>
          </p>
        </div>
      </Paper>
    );
  }
}

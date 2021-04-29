import React, { Component } from "react";
import Button from "@material-ui/core/Button";
import ConfigListView from "../ConfigListView/ConfigListView";
import Paper from "@material-ui/core/Paper";
import MotorsSlidersView from "./MotorsSlidersView";
import { FormattedMessage } from "react-intl";
import StatelessInput from "../Items/StatelessInput";
import { Typography } from "@material-ui/core";
export default class MotorsView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showMotorSliders: false
    };
  }

  render() {
    return (
      <div>
        <Paper>
          <div style={{ display: "flex", margin: 10 }}>
            <Button
              onClick={() =>
                this.setState({
                  showMotorSliders: !this.state.showMotorSliders
                })
              }
              variant="contained"
              color="primary"
            >{`${
              this.state.showMotorSliders ? "Hide" : "Show"
            } Motor Sliders`}</Button>
            <Button
              style={{ marginLeft: 20 }}
              color="secondary"
              variant="contained"
              onClick={() => this.props.openAssistant("GYRO")}
            >
              <FormattedMessage id="assistant.gyro.orientation" />
            </Button>
            <Button
              style={{ marginLeft: 20 }}
              color="secondary"
              variant="contained"
              onClick={() => this.props.openAssistant("motors")}
            >
              <FormattedMessage id="assistant.motors" />
            </Button>
            <div style={{ flexGrow: 1 }} />
          </div>
          {this.state.showMotorSliders && <MotorsSlidersView />}
        </Paper>
        <Paper style={{ marginLeft: 62 }}>
          <Typography variant="h6">
            <FormattedMessage id="ORIENTATION" />
          </Typography>
          <StatelessInput
            id="align_board_yaw"
            notifyDirty={this.props.notifyDirty}
          />
          <StatelessInput
            id="align_board_pitch"
            notifyDirty={this.props.notifyDirty}
          />
          <StatelessInput
            id="align_board_roll"
            notifyDirty={this.props.notifyDirty}
          />
        </Paper>
        <Paper>
          <ConfigListView
            features={this.props.features}
            fcConfig={this.props.fcConfig}
            notifyDirty={this.props.notifyDirty}
            items={this.props.items}
          />
        </Paper>
      </div>
    );
  }
}

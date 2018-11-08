import React, { Component } from "react";
import { Slider } from "material-ui-slider";
import HelperSelect from "../Items/HelperSelect";
import FCConnector from "../../utilities/FCConnector";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import ArrowDropDown from "@material-ui/icons/ArrowDropDown";
import { FormattedMessage } from "react-intl";

export default class AuxChannelItemView extends Component {
  constructor(props) {
    super(props);
    if (props.item.range[0] === props.item.range[1]) {
      props.item.range[1] += props.scale.step;
    }
    this.state = props.item;
  }

  updateValue() {
    this.setState({ isDirty: true });
    FCConnector.setMode(this.state).then(() => {
      this.setState({ isDirty: false });
      this.props.notifyDirty(true, this.state);
    });
  }
  render() {
    let sliderLeft = 0;
    if (this.state.channel > -1 && this.props.telemetry) {
      sliderLeft =
        ((this.props.telemetry[this.state.channel] - this.props.telemetryMin) *
          100) /
        (this.props.telemetryMax - this.props.telemetryMin);
    }

    return (
      <div style={{ display: "flex", flexDirection: "column" }}>
        <Typography>
          <strong>{"Aux Id: " + (this.state.id + 1)}</strong>
        </Typography>
        <div style={{ display: "flex" }}>
          <HelperSelect
            name={"mode " + this.state.id}
            label={"Mode"}
            disabled={this.props.modeDisabled}
            value={this.state.mode}
            onChange={event => {
              this.setState({ mode: event.target.value, isDirty: true });
            }}
            items={this.props.auxModeList}
          />
          <HelperSelect
            name={"aux " + this.state.id}
            label={"Aux Channel"}
            value={this.state.channel}
            onChange={event => {
              this.setState({ channel: event.target.value, isDirty: true });
            }}
            items={this.props.channels}
          />
          {this.state.isDirty && (
            <div
              style={{
                display: "flex",
                flex: "1",
                flexDirection: "row-reverse"
              }}
            >
              <Button
                name="aux_save"
                onClick={() => this.updateValue()}
                color="primary"
                variant="contained"
              >
                <FormattedMessage id="aux.item.save" />
              </Button>
            </div>
          )}
        </div>
        <div
          style={{
            position: "relative",
            height: 7,
            margin: "0 60px"
          }}
        >
          <ArrowDropDown
            style={{
              position: "absolute",
              left: `${sliderLeft}%`
            }}
            color="secondary"
            fontSize="large"
          />
        </div>
        <div style={{ display: "flex" }}>
          <Typography style={{ margin: "20px", fontFamily: "inherit" }}>
            {this.props.scale.min}
          </Typography>
          <Slider
            style={{ flex: "1" }}
            className={"aux" + this.state.id}
            value={this.state.range}
            min={this.props.scale.min}
            max={this.props.scale.max}
            scaleLength={this.props.scale.step}
            range={true}
            onChange={range => {
              this.setState({ range, isDirty: true });
            }}
          />
          <Typography style={{ margin: "20px" }}>
            {this.props.scale.max}
          </Typography>
        </div>
      </div>
    );
  }
}

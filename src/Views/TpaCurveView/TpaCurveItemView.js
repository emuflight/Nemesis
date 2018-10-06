import React, { Component } from "react";
import Slider from "@material-ui/lab/Slider";
import TextField from "@material-ui/core/TextField";
import Typography from "@material-ui/core/Typography";
import { FormattedMessage } from "react-intl";
import "./TpaCurveItem.css";

export default class TpaCurveItemView extends Component {
  constructor(props) {
    super(props);
    this.parser = parseInt;
    this.state = {
      isDirty: false,
      inputVal: this.props.item.current
    };
  }
  updateValue(newVal) {
    this.setState({ isDirty: true });
    this.props
      .updateCurve(newVal)
      .then(() => this.setState({ isDirty: false }));
  }
  componentWillReceiveProps(nextProps) {
    this.setState({ inputVal: nextProps.item.current });
  }
  render() {
    return (
      <div style={{ width: 40 }}>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <Typography
            variant="caption"
            style={{ marginLeft: 5, whiteSpace: "nowrap" }}
          >
            <FormattedMessage id={this.props.item.id} />
          </Typography>
          <Slider
            style={{ height: 80 }}
            value={this.parser(this.props.item.current)}
            disabled={!!this.state.isDirty}
            min={this.parser(this.props.item.min)}
            max={this.parser(this.props.item.max)}
            step={this.props.item.step}
            vertical={this.props.item.axis === "y"}
            reverse
            onChange={(event, inputVal) => {
              this.setState({ inputVal: this.parser(inputVal) });
              this.props.item.current = this.parser(inputVal);
              this.props.onChange && this.props.onChange(event, inputVal);
            }}
            onDragEnd={() => {
              this.updateValue(this.state.inputVal);
            }}
          />
        </div>
        <div>
          <TextField
            name={this.props.item.id}
            inputProps={{
              className: "tpa-slider-control-input"
            }}
            type="number"
            disabled={this.props.inputDisabled}
            value={this.parser(this.state.inputVal)}
            onBlur={() => {
              this.updateValue(this.state.inputVal);
            }}
            onChange={event => {
              this.setState({ inputVal: this.parser(event.target.value) });
            }}
          />
        </div>
      </div>
    );
  }
}

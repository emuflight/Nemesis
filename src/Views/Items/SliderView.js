import React, { Component } from "react";
import Slider from "@material-ui/lab/Slider";
import TextField from "@material-ui/core/TextField";
import FCConnector from "../../utilities/FCConnector";
import Typography from "@material-ui/core/Typography";
import { FormattedMessage } from "react-intl";
import "./SliderView.css";

export default class SliderView extends Component {
  constructor(props) {
    super(props);
    this.parser = parseInt;
    if (props.item.parse === "float") {
      this.parser = parseFloat;
    }
    this.state = {
      isDirty: false,
      inputVal: this.parser(this.props.item.current)
    };
  }
  updateValue(newVal) {
    this.setState({ isDirty: true });
    FCConnector.setValue(this.props.item.id, newVal).then(() => {
      this.props.item.current = this.parser(newVal);
      this.props.notifyDirty(true, this.state, newVal);
      this.setState({ isDirty: false, inputVal: newVal });
    });
  }
  UNSAFE_componentWillReceiveProps(nextProps) {
    this.setState({ inputVal: nextProps.item.current });
  }
  render() {
    return (
      <div className={`slider-control ${this.props.item.id}`}>
        <div className="slider-control-inner">
          <Typography className="slider-control-label">
            <FormattedMessage id={this.props.item.id} />
          </Typography>
          <Slider
            value={this.parser(this.props.item.current)}
            disabled={!!this.state.isDirty}
            min={this.parser(this.props.item.min)}
            max={this.parser(this.props.item.max)}
            step={this.props.item.step}
            vertical={this.props.item.axis === "y"}
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
        <TextField
          className="slider-control-input"
          classes={{ padding: 0 }}
          inputProps={{
            className: "slider-control-input"
          }}
          name={this.props.item.id}
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
    );
  }
}

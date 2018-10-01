import React, { Component } from "react";
import Slider from "@material-ui/lab/Slider";
import TextField from "@material-ui/core/TextField";
import FCConnector from "../../utilities/FCConnector";
import Typography from "@material-ui/core/Typography";

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
  componentWillReceiveProps(nextProps) {
    this.setState({ inputVal: nextProps.item.current });
  }
  render() {
    return (
      <div className="slider-control" style={{ flex: "1" }}>
        <div style={{ display: "flex", flexDirection: "column", width: 0 }}>
          <Typography>{this.props.item.id}</Typography>
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
            }}
            onDragEnd={() => {
              this.updateValue(this.state.inputVal);
            }}
          />
        </div>
        <div>
          <TextField
            name={this.props.item.id}
            style={{ width: 50 }}
            type="number"
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

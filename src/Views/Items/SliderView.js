import React, { Component } from "react";
import Slider from "material-ui/Slider";
import TextField from "material-ui/TextField";
import FCConnector from "../../utilities/FCConnector";

export default class SliderView extends Component {
  constructor(props) {
    super(props);
    this.notifyDirty = props.notifyDirty;
    this.state = {
      isDirty: false,
      inputVal: this.props.item.current
    };

    this.parser = parseInt;
    if (props.item.parse === "float") {
      this.parser = parseFloat;
    }
  }
  updateValue(newVal) {
    this.setState({ isDirty: true });
    FCConnector.setValue(this.props.item.id, newVal).then(() => {
      this.props.item.current = newVal;
      this.setState({ isDirty: false, inputVal: newVal });
    });
  }
  componentWillReceiveProps(nextProps) {
    this.setState({ inputVal: nextProps.item.current });
  }
  render() {
    return (
      <div id={this.props.item.id} style={{ display: "inline-block" }}>
        <h5>{this.props.item.id}</h5>
        <Slider
          style={{ height: "80px", width: "80px" }}
          className={this.props.item.id}
          value={this.parser(this.props.item.current)}
          disabled={!!this.state.isDirty}
          min={this.parser(this.props.item.min)}
          max={this.parser(this.props.item.max)}
          step={this.props.item.step}
          axis={this.props.item.axis}
          onChange={(event, newValue) => {
            this.props.item.current = this.parser(newValue);
          }}
          onDragStop={() => {
            this.updateValue(this.props.item.current);
          }}
        />
        <div>
          <TextField
            name={this.props.item.id}
            style={{ width: 40 }}
            type="number"
            value={this.parser(this.state.inputVal)}
            onBlur={() => {
              this.updateValue(this.parser(this.state.inputVal));
            }}
            onChange={(event, newVal) => {
              this.setState({ inputVal: newVal });
            }}
          />
        </div>
      </div>
    );
  }
}

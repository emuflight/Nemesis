import React, { Component } from "react";
import Slider from "material-ui/Slider";
import TextField from "material-ui/TextField";
import FCConnector from "../../utilities/FCConnector";

export default class SliderView extends Component {
  constructor(props) {
    super(props);
    props.item.newValue = props.item.current;
    this.state = props.item;
    this.notifyDirty = props.notifyDirty;
  }
  updateValue() {
    if (super.updateValue) {
      super.updateValue();
    } else {
      let isDirty =
        this.state.current !== this.state.newValue && !!this.state.current;
      this.notifyDirty(isDirty, this.state, this.state.newValue);
      this.setState({ current: this.state.newValue, isDirty: isDirty });
      FCConnector.setValue(this.state.id, this.state.newValue).then(() => {
        this.setState({ isDirty: false });
      });
    }
  }
  render() {
    let parser = parseInt;
    if (this.state.element.parse === "float") {
      parser = parseFloat;
    }
    return (
      <div id={this.state.id} style={{ display: "inline-block" }}>
        <h5>{this.state.id}</h5>
        <Slider
          style={{ height: "80px", width: "80px" }}
          className={this.state.id}
          value={parser(this.state.current)}
          disabled={!!this.state.isDirty}
          min={parser(this.state.min)}
          max={parser(this.state.max)}
          step={this.state.step}
          axis={this.state.axis}
          onChange={(event, newValue) => {
            this.setState({ newValue });
          }}
          onDragStop={() => {
            this.updateValue();
          }}
        />
        <div>
          <TextField
            name={this.state.id}
            style={{ width: 40 }}
            type="number"
            value={this.state.newValue}
            onBlur={() => this.updateValue()}
            onChange={(event, newValue) => {
              this.setState({ newValue });
            }}
          />
        </div>
      </div>
    );
  }
}

import React, { Component } from "react";
import Slider from "material-ui/Slider";
import FCConnector from "../../utilities/FCConnector";

export default class SliderView extends Component {
  constructor(props) {
    super(props);
    this.state = props.item;
    this.notifyDirty = props.notifyDirty;
  }
  render() {
    let parser = parseInt;
    if (this.state.element.parse === "float") {
      parser = parseFloat;
    }

    return (
      <div>
        <div>
          <label className="standalone-label">{this.state.id}</label>
        </div>
        <Slider
          id={this.state.id}
          value={parser(this.state.current)}
          disabled={!!this.state.isDirty}
          min={parser(this.state.min)}
          max={parser(this.state.max)}
          step={this.state.step}
          onChange={(event, key, payload) => {
            let isDirty =
              this.state.current !== payload && !!this.state.current;
            this.notifyDirty(isDirty);
            this.setState({ current: payload, isDirty: isDirty });
            FCConnector.setValue(this.state.id, payload).then(() => {
              this.setState({ isDirty: false });
            });
          }}
        />
      </div>
    );
  }
}

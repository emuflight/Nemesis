import React, { Component } from "react";
import HelperSelect from "./HelperSelect";
import FCConnector from "../../utilities/FCConnector";

export default class DropdownView extends Component {
  constructor(props) {
    super(props);
    this.state = props.item;
    this.notifyDirty = props.notifyDirty;
  }

  render() {
    return (
      <HelperSelect
        id={this.state.id}
        className={this.state.id}
        key={this.state.id}
        label={this.state.id}
        value={this.state.current}
        disabled={!!this.state.isDirty}
        onChange={event => {
          let payload = event.target.value;
          let isDirty = this.state.current !== payload && !!this.state.current;
          this.notifyDirty(isDirty, this.state, payload);
          this.setState({ current: payload, isDirty: isDirty });
          FCConnector.setValue(this.state.id, payload).then(() => {
            this.setState({ isDirty: false });
          });
        }}
        items={this.state.values}
      />
    );
  }
}

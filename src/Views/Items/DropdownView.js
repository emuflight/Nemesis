import React, { Component } from "react";
import FCConnector from "../../utilities/FCConnector";
import StatelessSelect from "./StatelessSelect";

export default class DropdownView extends Component {
  constructor(props) {
    super(props);
    this.state = props.item;
  }

  render() {
    const { ...other } = this.props;
    return (
      <StatelessSelect
        {...other}
        style={this.props.item && this.props.item.style}
        id={this.state.id}
        className={this.state.id}
        key={this.state.id}
        label={this.state.id}
        value={this.state.current}
        disabled={!!this.state.isDirty}
        onUpdate={this.props.onUpdate}
        onChange={event => {
          let payload = event.target.value;
          let isDirty = this.state.current !== payload;
          if (isDirty) {
            this.props.item.current = payload;
            this.props.notifyDirty(isDirty, this.state, payload);
            this.setState({ current: payload, isDirty: isDirty });
            FCConnector.setValue(this.state.id, payload).then(() => {
              this.setState({ isDirty: false });
            });
          }
        }}
        items={this.state.values}
      />
    );
  }
}

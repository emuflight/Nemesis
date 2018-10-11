import React, { Component } from "react";
import { FCConfigContext } from "../../App";
import InputView from "./InputView";

export default class StatelessInput extends Component {
  render() {
    const { ...other } = this.props;
    return (
      <FCConfigContext.Consumer>
        {config => {
          let item = config[this.props.item.id];
          this.props.onUpdate && this.props.onUpdate(item);
          return (
            <InputView
              {...other}
              notifyDirty={this.props.notifyDirty}
              item={item}
            />
          );
        }}
      </FCConfigContext.Consumer>
    );
  }
}

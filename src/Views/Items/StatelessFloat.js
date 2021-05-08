import React, { Component } from "react";
import { FCConfigContext } from "../../App";
import FloatView from "./FloatView";

export default class StatelessFloat extends Component {
  render() {
    const { ...other } = this.props;
    return (
      <FCConfigContext.Consumer>
        {config => {
          other.item = config[this.props.id || this.props.item.id];
          other.name_type = this.props.name_type;
          this.props.onUpdate && this.props.onUpdate(other.item);
          return <FloatView {...other} />;
        }}
      </FCConfigContext.Consumer>
    );
  }
}

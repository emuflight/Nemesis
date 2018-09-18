import React, { Component } from "react";

export default class ModesView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      modes: props.modes
    };
    this.notifyDirty = props.notifyDirty;
  }

  render() {
    return <div>XOMG MODESSSSSS</div>;
  }
}

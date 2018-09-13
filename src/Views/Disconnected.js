import React from "react";

export default class Disconnected extends React.Component {
  constructor(props) {
    super(props);
    this.uiMessage = props.message;
  }
  render() {
    return (
      <div>
        <p>Helio RC</p>
        <p>Please Connect to a Flight Controller</p>
        <p>{this.uiMessage}</p>
      </div>
    );
  }
}

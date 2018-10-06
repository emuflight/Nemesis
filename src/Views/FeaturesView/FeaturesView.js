import React, { Component } from "react";
import FeatureItemView from "./FeatureItemView";
import Paper from "@material-ui/core/Paper";

export default class FeaturesView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      features: props.features
    };
  }

  render() {
    return (
      <Paper theme={this.state.theme} elevation={3}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)"
          }}
        >
          {this.state.features.map(feature => {
            return (
              <FeatureItemView
                notifyDirty={this.props.notifyDirty}
                key={feature.id}
                item={feature}
              />
            );
          })}
        </div>
      </Paper>
    );
  }
}

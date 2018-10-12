import React, { Component } from "react";
import FeatureItemView from "./FeatureItemView";
import Paper from "@material-ui/core/Paper";

export default class FeaturesView extends Component {
  constructor(props) {
    super(props);
    let filteredFeatures = this.props.fcConfig.imuf
      ? props.features.filter(feature => feature.id !== "DYNAMIC_FILTER")
      : props.features;
    this.state = {
      features: filteredFeatures.sort((a, b) => a.id > b.id)
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
                hasPort={feature.hasPort}
              />
            );
          })}
        </div>
      </Paper>
    );
  }
}

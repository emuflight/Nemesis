import React, { Component } from "react";
import FeatureItemView from "./FeatureItemView";
import Paper from "@material-ui/core/Paper";

export default class FeaturesView extends Component {
  constructor(props) {
    super(props);
    let filteredFeatures = this.props.fcConfig.imuf
      ? //? props.features.filter(feature => feature.id !== "DYNAMIC_FILTER")
        // uncomment above line and comment the one below if we want to disable DYNAMIC_FILTER for helio again
        props.features
      : props.features;
    this.state = {
      features: filteredFeatures.sort((a, b) => a.id > b.id)
    };
  }

  render() {
    return (
      <Paper>
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

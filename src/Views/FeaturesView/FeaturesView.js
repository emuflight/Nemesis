import React, { Component } from "react";
import FeatureItemView from "./FeatureItemView";
import { List } from "material-ui/List";

export default class FeaturesView extends Component {
  constructor(props) {
    super(props);
    this.notifyDirty = props.notifyDirty;
    this.state = {
      features: props.features.map(feature => {
        let current = "ON",
          key = feature;
        if (feature.startsWith("-")) {
          current = "OFF";
          key = key.slice(1);
        }
        return {
          id: key,
          key: key,
          current: current,
          mode: "LOOKUP",
          values: [
            {
              value: "OFF",
              label: "OFF"
            },
            {
              value: "ON",
              label: "ON"
            }
          ]
        };
      })
    };
    console.log(this.state);
    this.notifyDirty = props.notifyDirty;
  }

  render() {
    return (
      <List>
        {this.state.features.map(feature => {
          return (
            <FeatureItemView
              notifyDirty={this.notifyDirty}
              key={feature.id}
              item={feature}
            />
          );
        })}
      </List>
    );
  }
}

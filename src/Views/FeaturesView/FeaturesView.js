import React, { Component } from "react";
import FeatureItemView from "./FeatureItemView";
import Paper from "material-ui/Paper";
import { List } from "material-ui";

export default class FeaturesView extends Component {
  constructor(props) {
    super(props);
    this.notifyDirty = props.notifyDirty;
    this.state = {
      features: props.features
    };
    this.notifyDirty = props.notifyDirty;
  }

  render() {
    return (
      <Paper zDepth={3} style={{ margin: "10px", padding: "10px" }}>
        <List style={{ width: "300px" }}>
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
      </Paper>
    );
  }
}

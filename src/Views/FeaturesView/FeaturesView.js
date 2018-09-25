import React, { Component } from "react";
import FeatureItemView from "./FeatureItemView";
import Paper from "@material-ui/core/Paper";
import List from "@material-ui/core/List";
import theme from "../../Themes/Dark";

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
      <Paper
        theme={theme}
        elevation={3}
        style={{ margin: "10px", padding: "10px" }}
      >
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

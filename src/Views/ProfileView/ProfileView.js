import React, { Component } from "react";
import ConfigListView from "../ConfigListView/ConfigListView";
import DropdownView from "../Items/DropdownView";
import Paper from "material-ui/Paper";

export default class ProfileView extends Component {
  constructor(props) {
    super(props);
    this.notifyDirty = props.notifyDirty;
    this.state = {
      id: props.id,
      current: props.active,
      values: props.profileList
    };
  }

  getContent() {
    return (
      <ConfigListView
        ref="listView"
        notifyDirty={this.notifyDirty}
        items={this.props.items}
      />
    );
  }

  render() {
    return (
      <div>
        <Paper zDepth={3} style={{ margin: "10px", padding: "10px" }}>
          <DropdownView
            ref="profSelector"
            style={{ display: "block" }}
            notifyDirty={this.notifyDirty}
            key={this.state.id}
            item={this.state}
          />
        </Paper>
        {this.getContent()}
      </div>
    );
  }
}

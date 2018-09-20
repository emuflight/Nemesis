import React, { Component } from "react";
import ConfigListView from "../ConfigListView/ConfigListView";
import DropdownView from "../Items/DropdownView";

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
        <DropdownView
          ref="profSelector"
          style={{ display: "block" }}
          notifyDirty={this.notifyDirty}
          key={this.state.id}
          item={this.state}
        />
        {this.getContent()}
      </div>
    );
  }
}

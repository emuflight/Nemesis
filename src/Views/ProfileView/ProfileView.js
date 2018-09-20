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

  render() {
    return (
      <div>
        <div>
          <DropdownView
            notifyDirty={this.notifyDirty}
            key={this.state.id}
            item={this.state}
          />
        </div>
        <ConfigListView
          notifyDirty={this.notifyDirty}
          items={this.props.items}
        />
      </div>
    );
  }
}

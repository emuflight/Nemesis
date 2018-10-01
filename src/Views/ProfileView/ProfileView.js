import React, { Component } from "react";
import ConfigListView from "../ConfigListView/ConfigListView";
import HelperSelect from "../Items/HelperSelect";
import Paper from "@material-ui/core/Paper";

export default class ProfileView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isBxF: props.fcConfig.isBxF
    };
  }

  getContent() {
    return (
      <ConfigListView
        ref="listView"
        notifyDirty={this.props.notifyDirty}
        items={this.props.items}
      />
    );
  }

  render() {
    return (
      <div>
        <Paper
          theme={this.state.theme}
          elevation={3}
          style={{ margin: "10px", padding: "10px" }}
        >
          <HelperSelect
            id={this.props.id}
            className={this.props.id}
            label={this.props.id}
            value={this.props.active}
            onChange={event => this.props.changeProfile(event.target.value)}
            items={this.props.profileList}
          />
        </Paper>
        {this.getContent()}
      </div>
    );
  }
}

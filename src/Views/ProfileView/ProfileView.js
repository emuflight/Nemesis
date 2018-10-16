import React, { Component } from "react";
import ConfigListView from "../ConfigListView/ConfigListView";
import HelperSelect from "../Items/HelperSelect";
import Paper from "@material-ui/core/Paper";
import { FCConfigContext } from "../../App";

export default class ProfileView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isBxF: props.fcConfig.isBxF
    };
  }

  get children() {
    return (
      <ConfigListView
        ref="listView"
        fcConfig={this.props.fcConfig}
        notifyDirty={this.props.notifyDirty}
        items={this.props.items}
      />
    );
  }

  render() {
    return (
      <div>
        <Paper>
          <FCConfigContext.Consumer>
            {config => {
              const item = config[this.props.id];
              item.current = parseInt(item.current, 10);
              return (
                <HelperSelect
                  id={this.props.id}
                  className={this.props.id}
                  label={this.props.id}
                  value={item.current}
                  onChange={event =>
                    this.props.changeProfile(event.target.value)
                  }
                  items={this.props.profileList}
                />
              );
            }}
          </FCConfigContext.Consumer>
        </Paper>
        {this.children}
      </div>
    );
  }
}

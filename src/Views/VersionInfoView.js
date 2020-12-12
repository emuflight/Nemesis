import React, { Component } from "react";
import List from "@material-ui/core/List";
import MenuItem from "@material-ui/core/MenuItem";
import Popover from "@material-ui/core/Popover";
import Launch from "@material-ui/icons/Launch";
import FCConnector from "../utilities/FCConnector";
import { FormattedMessage } from "react-intl";

export default class VersionInfoView extends Component {
  constructor(props) {
    super(props);

    this.goToImuf = props.goToImuf;
    this.state = props.version;
    this.state.open = false;
  }

  handleClick = event => {
    // This prevents ghost click.
    event.preventDefault();
    this.setState({
      open: !this.state.open,
      anchorEl: event.currentTarget
    });
  };

  handleRequestClose = () => {
    this.setState({
      open: false
    });
  };
  render() {
    return (
      <List>
        <MenuItem>
          {
            <FormattedMessage
              id="info.firmware"
              values={{ value: this.state.fw }}
            />
          }
        </MenuItem>
        <MenuItem>
          {
            <FormattedMessage
              id="info.target"
              values={{ value: this.state.target }}
            />
          }
        </MenuItem>
        <MenuItem style={{ display: "flex" }}>
          <div style={{ flexGrow: 1 }}>
            <FormattedMessage
              id="info.version"
              values={{ value: this.state.version }}
            />
          </div>
        </MenuItem>
        {this.state.imuf && (
          <MenuItem style={{ display: "flex" }}>
            <div style={{ flexGrow: 1 }}>
              <FormattedMessage
                id="info.imuf"
                values={{ value: this.state.imuf }}
              />
            </div>
            <Launch onClick={() => this.goToImuf()} />
          </MenuItem>
        )}
      </List>
    );
  }
}

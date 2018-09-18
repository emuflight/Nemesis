import React, { Component } from "react";
import Menu from "material-ui/Menu";
import MenuItem from "material-ui/MenuItem";
import Popover from "material-ui/Popover";
import RaisedButton from "material-ui/RaisedButton";

export default class VersionInfoView extends Component {
  constructor(props) {
    super(props);
    this.version = props.version.split("|");
    this.goToDFU = props.goToDFU;
    this.goToImuf = props.goToImuf;
    console.log(props.version);
    this.state = {
      fw: this.version[0],
      target: this.version[1],
      version: this.version[3],
      imuf: props.imuf
    };
  }

  handleClick = event => {
    // This prevents ghost click.
    event.preventDefault();
    this.setState({
      open: true,
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
      <div>
        <RaisedButton onClick={this.handleClick} label="Version Info" />
        <Popover
          open={this.state.open}
          anchorEl={this.state.anchorEl}
          anchorOrigin={{ horizontal: "left", vertical: "bottom" }}
          targetOrigin={{ horizontal: "left", vertical: "top" }}
          onRequestClose={this.handleRequestClose}
        >
          <Menu>
            <MenuItem primaryText={"Firmware: " + this.state.fw} />
            <MenuItem primaryText={"Target: " + this.state.target} />
            <MenuItem
              onClick={() => this.goToDFU()}
              primaryText={"Version: " + this.state.version}
            />
            {this.state.imuf && (
              <MenuItem
                onClick={() => this.goToImuf()}
                primaryText={"IMU-F Version: " + this.state.imuf}
              />
            )}
          </Menu>
        </Popover>
      </div>
    );
  }
}

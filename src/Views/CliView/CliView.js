import React, { Component } from "react";
import MenuItem from "@material-ui/core/MenuItem";
import TextField from "@material-ui/core/TextField";
import SwipeableDrawer from "@material-ui/core/SwipeableDrawer";
import FCConnector from "../../utilities/FCConnector";
import "./CliView.css";

export default class CliView extends Component {
  constructor(props) {
    super(props);
    this.commandIndex = 0;
    this.prevCommands = [];
    this.state = {
      cliBuffer: this.props.startText || "#flashEmu\n\n#",
      stayOpen: !!this.props.stayOpen || false,
      disabled: this.props.disabled || false,
      open: this.props.stayOpen || !!this.props.open,
      allowClose: true
    };
  }
  toggleCli(state) {
    let openState = this.state.stayOpen || state;
    if (openState || this.state.allowClose) {
      this.setState({
        cliBuffer: this.props.startText || "#flashEmu\n\n#",
        command: "",
        open: openState
      });
      if (openState) {
        FCConnector.pauseTelemetry();
      } else {
        FCConnector.resumeTelemetry();
      }
    }
  }
  replaceLast(update) {
    this.setState({
      disabled: false,
      cliBuffer: this.prevCli + update
    });
    this.refs.cliScroll.scrollTop = this.refs.cliScroll.scrollHeight;
    this.refs.cliInput.focus();
  }
  appendCliBuffer(resp) {
    this.prevCli = this.state.cliBuffer;
    this.setState({ disabled: false, cliBuffer: this.prevCli + resp });
    this.refs.cliScroll.scrollTop = this.refs.cliScroll.scrollHeight;
    this.refs.cliInput.focus();
  }
  handleKeyDown = e => {
    if (e.keyCode === 38) {
      // ARROW UP key
      let oldVal = this.prevCommands[this.commandIndex];
      e.target.value = oldVal || e.target.value;
      this.setState({ command: e.target.value });
      if (this.commandIndex > 0) {
        --this.commandIndex;
      }
    } else if (e.keyCode === 40) {
      // ARROW DOWN key
      if (this.commandIndex < this.prevCommands.length - 1) {
        ++this.commandIndex;
      }
      let oldVal = this.prevCommands[this.commandIndex];
      e.target.value = oldVal || e.target.value;
      this.setState({ command: e.target.value });
    } else if (e.keyCode === 13) {
      // ENTER key
      if (e.target.value === "") {
        e.preventDefault();
        e.stopPropagation();
        e.target.value = "";
        this.setState({ command: "" });
      } else {
        if (
          e.target.value !== this.prevCommands[this.prevCommands.length - 1]
        ) {
          this.prevCommands.push(e.target.value);
        }
        this.commandIndex = this.prevCommands.length - 1;
        e.preventDefault();
        e.stopPropagation();
        e.target.value = "";
        this.setState({ disabled: true });
        if (this.state.command) {
          let commands = this.state.command
            .split(/\r|\n/gim)
            .filter(com => com);
          this.setState({ allowClose: false });
          FCConnector.sendBulkCommands(
            commands.filter(line => !line.startsWith("#")),
            notifyResp => {
              this.appendCliBuffer(notifyResp);
            }
          ).then(() => {
            this.setState({ disabled: false });
            this.setState({ allowClose: true });
          });
        }
      }
    }
  };
  render() {
    return (
      <div>
        {!this.state.open &&
          !this.state.disabled && (
            <MenuItem
              style={{ display: "flex", padding: 8 }}
              onClick={() => {
                this.toggleCli(true);
              }}
            >
              <div style={{ flexGrow: 1 }}>CLI</div>
            </MenuItem>
          )}
        <SwipeableDrawer
          anchor="bottom"
          onOpen={() => {}}
          onClose={() => !this.state.disabled && this.toggleCli(false)}
          open={this.state.open}
        >
          <div className="cli-background">
            <div className="cli-scroll" ref="cliScroll">
              <div
                className="cli-content"
                dangerouslySetInnerHTML={{ __html: this.state.cliBuffer }}
              />
            </div>
            <TextField
              className="cli-input"
              inputRef={input => (this.refs.cliInput = input)}
              name="cli-input"
              variant="outlined"
              helperText="Enter cli commands..."
              multiline
              autoFocus
              disabled={this.state.disabled}
              rowsMax="1"
              onChange={event => this.setState({ command: event.target.value })}
              onKeyDown={e => this.handleKeyDown(e)}
            />
          </div>
        </SwipeableDrawer>
      </div>
    );
  }
}

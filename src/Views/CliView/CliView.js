import React, { Component } from "react";
import { BottomSheet } from "material-ui-bottom-sheet";
import KeyboardIcon from "material-ui/svg-icons/hardware/keyboard";
import KeyboardHideIcon from "material-ui/svg-icons/hardware/keyboard-hide";
import TextField from "material-ui/TextField";
import FCConnector from "../../utilities/FCConnector";

export default class CliView extends Component {
  constructor(props) {
    super(props);
    this.commandIndex = 0;
    this.prevCommands = [];
    this.state = {};
  }
  toggleCli(state) {
    this.setState({
      cliBuffer: "# ",
      command: "",
      open: state
    });
    this.refs.cliInput.focus();
  }
  setCliBuffer(resp) {
    this.setState({ isDirty: false, cliBuffer: this.state.cliBuffer + resp });
    this.refs.cliScroll.scrollTop = this.refs.cliScroll.scrollHeight;
  }
  handleKeyDown = e => {
    if (e.keyCode === 38) {
      let oldVal = this.prevCommands[Math.min(--this.commandIndex, 0)];
      e.target.value = oldVal || e.target.value;
    } else if (e.keyCode === 40) {
      let oldVal = this.prevCommands[
        Math.min(++this.commandIndex, this.prevCommands.length)
      ];
      e.target.value = oldVal || e.target.value;
    } else if (e.keyCode === 13) {
      if (e.target.value !== this.prevCommands[this.prevCommands.length]) {
        this.prevCommands.push(e.target.value);
        this.commandIndex = this.prevCommands.length;
      }
      e.preventDefault();
      e.stopPropagation();
      e.target.value = "";
      this.setState({ isDirty: true });
      FCConnector.sendCliCommand(this.state.command).then(resp =>
        this.setCliBuffer(resp)
      );
    }
  };
  render() {
    return (
      <div>
        {!this.state.open && (
          <KeyboardIcon
            style={{ position: "fixed", bottom: "20px", right: "20px" }}
            onClick={() => this.toggleCli(true)}
          />
        )}
        <BottomSheet
          onRequestClose={() => this.toggleCli(false)}
          open={this.state.open}
          action={<KeyboardHideIcon onClick={() => this.toggleCli(false)} />}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              height: "600px"
            }}
          >
            <div
              ref="cliScroll"
              style={{
                flex: "1",
                border: "1px solid silver",
                backgroundColor: "rgba(0, 0, 0, 0.75)",
                marginTop: "0px",
                borderRadius: "5px",
                boxShadow: "inset 0px 0px 20px rgba(0, 0, 0, 0.80)",
                overflowY: "scroll",
                overflowX: "hidden"
              }}
            >
              <div
                style={{
                  padding: "5px",
                  fontFamily: "monospace",
                  fontWeight: "bold",
                  color: "white",
                  boxSizing: "border-box",
                  userSelect: "text",
                  whiteSpace: "pre-wrap"
                }}
              >
                {this.state.cliBuffer}
              </div>
            </div>
            <div style={{ height: "50px", padding: "10px" }}>
              <TextField
                ref="cliInput"
                name="cli-input"
                placeholder="Enter cli commands..."
                multiLine={true}
                rowsMax={1}
                fullWidth={true}
                errorText={this.state.isDirty && "Sending..."}
                errorStyle={{ color: "rgb(0, 188, 212)" }}
                onChange={(event, command) => this.setState({ command })}
                onKeyDown={e => this.handleKeyDown(e)}
              />
            </div>
          </div>
        </BottomSheet>
      </div>
    );
  }
}

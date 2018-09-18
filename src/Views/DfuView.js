import React, { Component } from "react";
import SelectField from "material-ui/SelectField";
import MenuItem from "material-ui/MenuItem";
import RaisedButton from "material-ui/RaisedButton";
import FCConnector from "../utilities/FCConnector";

export default class DfuView extends Component {
  constructor(props) {
    super(props);
    this.title = this.flText = "Select a firmware to flash";
    this.btnLabel = "Update";
    this.state = {
      items: props.firmwares,
      current: props.firmwares[0].url,
      note: props.firmwares[0].note,
      isFlashing: false
    };
  }

  handleFlash() {
    this.setState({ isFlashing: true });
    FCConnector.flashDFU(this.state.current, progress => {
      this.setState({ progress });
    }).then(done => {
      this.setState({ isFlashing: false, note: done });
    });
  }

  render() {
    return (
      <div>
        <p>{this.title}</p>
        <SelectField
          autoWidth={true}
          floatingLabelText={this.flText}
          value={this.state.current}
          disabled={this.state.isFlashing}
          onChange={(event, key, payload) => {
            this.setState({ current: payload });
          }}
        >
          {this.state.items.map((fw, index) => {
            return (
              <MenuItem key={index} primaryText={fw.name} value={fw.url} />
            );
          })}
        </SelectField>
        <RaisedButton
          style={{ margin: "20px" }}
          primary={true}
          onClick={() => this.handleFlash()}
          disabled={this.state.isFlashing}
          label={this.btnLabel}
        />
        <p>{this.state.note}</p>
      </div>
    );
  }
}

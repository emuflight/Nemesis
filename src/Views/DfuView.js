import React, { Component } from "react";
import SelectField from "material-ui/SelectField";
import MenuItem from "material-ui/MenuItem";
import RaisedButton from "material-ui/RaisedButton";
import FCConnector from "../utilities/FCConnector";

export default class DfuView extends Component {
  constructor(props) {
    super(props);
    props.info.current = props.info.firmwares[0].url;
    props.info.note = props.info.firmwares[0].note;
    props.info.isFlashing = false;
    this.state = props.info;
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
        <p>DFU flash</p>
        <SelectField
          autoWidth={true}
          floatingLabelText={"Select a firmware to flash"}
          value={this.state.current}
          disabled={this.state.isFlashing}
          onChange={(event, key, payload) => {
            this.setState({ current: payload });
          }}
        >
          {this.state.firmwares.map((fw, index) => {
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
          label="Flash"
        />
        <p>{this.state.note}</p>
      </div>
    );
  }
}

import React, { Component } from "react";
import FCConnector from "../../utilities/FCConnector";
import FormGroup from "@material-ui/core/FormGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Switch from "@material-ui/core/Switch";
import { FormattedMessage } from "react-intl";
// import uiPorts from "../PortsView/ports_modes.json";
// import HelperSelect from "../Items/HelperSelect";

export default class FeatureItemView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      checked: this.props.item.current,
      selectedPort: this.props.item.hasPort && this.props.item.port
    };
  }
  handleToggle = payload => {
    this.props.notifyDirty(true, this.props.item, payload);
    this.setState({ checked: payload });
    FCConnector.sendCliCommand(
      `feature ${payload ? "" : "-"}${this.props.item.id}`
    );
  };
  render() {
    return (
      <FormGroup component="fieldset">
        <FormControlLabel
          control={
            <Switch
              id={this.props.item.id}
              checked={this.state.checked}
              onChange={(event, isInputChecked) => {
                this.handleToggle(isInputChecked);
              }}
            />
          }
          label={<FormattedMessage id={this.props.item.id} />}
        />
        {/* {this.props.hasPort && (
          <HelperSelect
            label={"UART"}
            name={`feature_port_${this.props.item.id}`}
            value={this.state.selectedPort}
            onChange={event => {
              console.log(this.props.item);

              this.setState({ selectedPort: event.target.value, isDirty: true });
              // FCConnector.sendCommand(
              //   `serial ${this.props.item.id} ${payload} ${this.props.item.mspBaud} ${
              //     this.props.item.gpsBaud
              //   } ${this.props.item.telemBaud} ${this.props.item.bblBaud}`
              // ).then(() => {
              //   this.setState({ isDirty: false });
              // });
            }}
            items={this.props.item.ports.values.map((port, i) => {
              return {
                value: i,
                label: uiPorts.ports[i.toString()]
              }
            })}
          ></HelperSelect>)} */}
      </FormGroup>
    );
  }
}

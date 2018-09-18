import React from "react";
import DropdownView from "../Items/DropdownView";
import SelectField from "material-ui/SelectField";
import MenuItem from "material-ui/MenuItem";
import FCConnector from "../../utilities/FCConnector";

export default class FeatureItemView extends DropdownView {
  constructor(props) {
    super(props);
    this.state = props.item;
    this.notifyDirty = props.notifyDirty;
  }
  componentDidMount() {
    document.getElementById(this.state.id).$state = this.state;
  }
  render() {
    return (
      <div id={this.state.id}>
        <SelectField
          className={this.state.id}
          key={this.state.id}
          floatingLabelText={this.state.id}
          value={this.state.current}
          disabled={this.state.isDirty}
          errorText={this.state.isDirty && "Saving..."}
          errorStyle={{ color: "rgb(0, 188, 212)" }}
          onChange={(event, key, payload) => {
            this.setState({ current: payload, isDirty: true });
            FCConnector.sendCommand(
              `feature ${payload === "OFF" ? "-" : ""}${this.state.id}`
            ).then(() => {
              this.setState({ isDirty: false });
            });
          }}
        >
          {this.state.values.map(item => {
            return (
              <MenuItem
                key={item.value}
                primaryText={item.label}
                value={item.value}
              />
            );
          })}
        </SelectField>
      </div>
    );
  }
}

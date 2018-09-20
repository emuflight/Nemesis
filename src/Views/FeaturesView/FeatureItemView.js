import React from "react";
import DropdownView from "../Items/DropdownView";
import SelectField from "material-ui/SelectField";
import MenuItem from "material-ui/MenuItem";
import FCConnector from "../../utilities/FCConnector";

export default class FeatureItemView extends DropdownView {
  constructor(props) {
    super(props);
    this.notifyDirty = props.notifyDirty;
  }
  componentDidMount() {
    document.getElementById(this.props.item.id).$state = this.props.item;
  }
  render() {
    return (
      <div id={this.props.item.id}>
        <SelectField
          className={this.props.item.id}
          key={this.props.item.id}
          floatingLabelText={this.props.item.id}
          value={this.props.item.current}
          disabled={this.props.item.isDirty}
          errorText={this.props.item.isDirty && "Saving..."}
          errorStyle={{ color: "rgb(0, 188, 212)" }}
          onChange={(event, key, payload) => {
            this.setState({ current: payload, isDirty: true });
            FCConnector.sendCommand(
              `feature ${payload === "OFF" ? "-" : ""}${this.props.item.id}`
            ).then(() => {
              this.setState({ isDirty: false });
            });
          }}
        >
          {this.props.item.values.map(item => {
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

import React, { Component } from "react";
import SelectField from "material-ui/SelectField";
import MenuItem from "material-ui/MenuItem";
import FCConnector from "../../utilities/FCConnector";

export default class DropdownView extends Component {
  constructor(props) {
    super(props);
    this.state = props.item;
    this.notifyDirty = props.notifyDirty;
  }
  render() {
    return (
      <div>
        <SelectField
          id={this.state.id}
          key={this.state.id}
          floatingLabelText={this.state.id}
          value={this.state.current}
          disabled={!!this.state.isDirty}
          errorText={this.state.isDirty && "Saving..."}
          errorStyle={{ color: "rgb(0, 188, 212)" }}
          onChange={(event, key, payload) => {
            let isDirty =
              this.state.current !== payload && !!this.state.current;
            this.notifyDirty(isDirty);
            this.setState({ current: payload, isDirty: isDirty });
            FCConnector.setValue(this.state.id, payload).then(() => {
              this.setState({ isDirty: false });
            });
          }}
        >
          {this.state.values &&
            this.state.values.map(item => {
              return <MenuItem key={item} primaryText={item} value={item} />;
            })}
        </SelectField>
      </div>
    );
  }
}

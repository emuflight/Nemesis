import React, { Component } from "react";
import SelectField from "material-ui/SelectField";
import MenuItem from "material-ui/MenuItem";

export default class DropdownView extends Component {
  constructor(props) {
    super(props);
    this.state = props.item;
  }
  render() {
    return (
      <div>
        <SelectField
          id={this.state.id}
          key={this.state.id}
          floatingLabelText={this.state.id}
          value={this.state.current}
          onChange={itemValue => this.setState({ new: itemValue })}
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

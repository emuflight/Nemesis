import React, { Component } from "react";
import { withStyles } from "@material-ui/core/styles";
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";

class HelperSelect extends Component {
  // constructor(props) {
  //   super(props);
  //   this.state = {
  //     value: props.value,
  //   }
  // }
  render() {
    const { classes } = this.props;
    return (
      <FormControl
        classes={{ root: this.props.id }}
        style={this.props.style}
        className={classes.formControl}
      >
        <InputLabel shrink htmlFor={`${this.props.name}-label-placeholder`}>
          {this.props.label}
        </InputLabel>
        <Select
          value={this.props.value}
          onChange={this.props.onChange}
          inputProps={{
            id: `${this.props.name}-label-placeholder`,
            name: this.props.name
          }}
          displayEmpty
          disabled={this.props.disabled}
          name={this.props.name}
          className={classes.selectEmpty}
        >
          {this.props.items &&
            this.props.items.map(item => {
              return (
                <MenuItem key={item.value} value={item.value}>
                  {item.label}
                </MenuItem>
              );
            })}
        </Select>
      </FormControl>
    );
  }
}

const styles = theme => ({
  root: {
    display: "flex",
    flexWrap: "wrap"
  },
  formControl: {
    margin: theme.spacing.unit,
    minWidth: 120
  },
  selectEmpty: {
    marginTop: theme.spacing.unit * 2
  }
});

export default withStyles(styles)(HelperSelect);

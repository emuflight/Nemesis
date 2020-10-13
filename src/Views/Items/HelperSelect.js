import React, { Component } from "react";
import { withStyles } from "@material-ui/core/styles";
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
import FormControl from "@material-ui/core/FormControl";
import FormHelperText from "@material-ui/core/FormHelperText";
import Select from "@material-ui/core/Select";
import { injectIntl, intlShape, FormattedMessage } from "react-intl";

const HelperSelect = class extends Component {
  render() {
    const { classes } = this.props;
    return (
      <FormControl
        classes={{ root: this.props.id }}
        style={this.props.style}
        className={classes.formControl}
      >
        <InputLabel
          className={this.props.labelClassName}
          shrink
          htmlFor={`${this.props.name}-label-placeholder`}
          style={{ whiteSpace: "nowrap" }}
        >
          <FormattedMessage id={this.props.label} />
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
                <MenuItem key={item.id} value={item.value}>
                  <FormattedMessage id={item.label} />
                </MenuItem>
              );
            })}
        </Select>
        {this.props.intl.messages[`${this.props.id}.helper`] && (
          <FormHelperText>
            <FormattedMessage id={`${this.props.id}.helper`} />
          </FormHelperText>
        )}
      </FormControl>
    );
  }
};

HelperSelect.propTypes = {
  intl: intlShape.isRequired
};

const styles = theme => ({
  root: {
    display: "flex",
    flexWrap: "wrap"
  },
  formControl: {
    margin: theme.spacing(),
    minWidth: 120
  },
  selectEmpty: {
    marginTop: theme.spacing(2)
  }
});

export default withStyles(styles)(injectIntl(HelperSelect));

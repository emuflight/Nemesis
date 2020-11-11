import React, { Component } from "react";
import { withStyles } from "@material-ui/core/styles";
import { injectIntl, intlShape } from "react-intl";
import { FCConfigContext } from "../../App";
import HelperSelect from "./HelperSelect";
import FCConnector from "../../utilities/FCConnector";

const StatelessSelect = class extends Component {
  render() {
    return (
      <FCConfigContext.Consumer>
        {config => {
          let item = config[this.props.id];
          this.props.onUpdate && this.props.onUpdate(item);
          return (
            <HelperSelect
              style={item && item.style}
              id={item.id}
              className={item.id}
              key={item.id}
              label={item.id}
              value={item.current}
              disabled={!!item.isDirty}
              onUpdate={this.props.onUpdate}
              onChange={event => {
                let payload = event.target.value;
                let isDirty = item.current !== payload;
                if (isDirty) {
                  item.current = payload;
                  this.props.notifyDirty(isDirty, item, payload);
                  this.setState({ current: payload, isDirty: isDirty });
                  FCConnector.setValue(item.id, payload).then(() => {
                    this.setState({ isDirty: false });
                  });
                }
              }}
              items={item.values}
            />
          );
        }}
      </FCConfigContext.Consumer>
    );
  }
};

StatelessSelect.propTypes = {
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

export default withStyles(styles)(injectIntl(StatelessSelect));

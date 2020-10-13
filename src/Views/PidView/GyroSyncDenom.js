import React, { Component } from "react";
import { withStyles } from "@material-ui/core/styles";
import { injectIntl, intlShape } from "react-intl";
import { FCConfigContext } from "../../App";
import HelperSelect from "../Items/HelperSelect";
import FCConnector from "../../utilities/FCConnector";

const GyroSyncDenom = class extends Component {
  state = { isDirty: false };
  render() {
    return (
      <FCConfigContext.Consumer>
        {config => {
          let use32K =
            config.version.imuf ||
            (config.gyro_use_32khz && config.gyro_use_32khz.current === "ON");
          let gyroItem = config.gyro_sync_denom;

          let gyroValues = use32K
            ? gyroItem.values
            : gyroItem.values.slice(2).map((item, i) => {
                return {
                  value: gyroItem.values[i].value,
                  label: item.label
                };
              });

          return (
            <HelperSelect
              id={gyroItem.id}
              className={gyroItem.id}
              label={gyroItem.id}
              value={gyroItem.current}
              disabled={!!this.state.isDirty}
              onChange={event => {
                let payload = event.target.value;
                let isDirty = gyroItem.current !== payload;
                if (isDirty) {
                  gyroItem.current = payload;
                  this.props.notifyDirty(isDirty, gyroItem, payload);
                  this.setState({ current: payload, isDirty: isDirty });
                  FCConnector.setValue(gyroItem.id, payload).then(() => {
                    this.setState({ isDirty: false });
                  });
                }
              }}
              items={gyroValues}
            />
          );
        }}
      </FCConfigContext.Consumer>
    );
  }
};

GyroSyncDenom.propTypes = {
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

export default withStyles(styles)(injectIntl(GyroSyncDenom));

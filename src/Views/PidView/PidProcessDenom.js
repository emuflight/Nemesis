import React, { Component } from "react";
import { withStyles } from "@material-ui/core/styles";
import { injectIntl, intlShape } from "react-intl";
import { FCConfigContext } from "../../App";
import HelperSelect from "../Items/HelperSelect";
import FCConnector from "../../utilities/FCConnector";

const PidProcessDenom = class extends Component {
  state = { isDirty: false };
  render() {
    return (
      <FCConfigContext.Consumer>
        {config => {
          let use32K =
            config.version.imuf ||
            (config.gyro_use_32khz && config.gyro_use_32khz.current === "ON");

          let gyroValues = use32K
            ? config.gyro_sync_denom.values
            : config.gyro_sync_denom.values.slice(2).map((item, i) => {
                return {
                  value: config.gyro_sync_denom.values[i].value,
                  label: item.label
                };
              });

          let offset = 0;
          gyroValues.forEach((v, i) => {
            if (v.value === config.gyro_sync_denom.current) {
              offset = i;
            }
          });
          let pidItem = config.pid_process_denom;
          return (
            <HelperSelect
              id={pidItem.id}
              className={pidItem.id}
              label={pidItem.id}
              value={pidItem.current}
              disabled={!!this.state.isDirty}
              onChange={event => {
                let payload = event.target.value;
                let isDirty = pidItem.current !== payload;
                if (isDirty) {
                  pidItem.current = payload;
                  this.props.notifyDirty(isDirty, pidItem, payload);
                  this.setState({ current: payload, isDirty: isDirty });
                  FCConnector.setValue(pidItem.id, payload).then(() => {
                    this.setState({ isDirty: false });
                  });
                }
              }}
              items={gyroValues.slice(offset).map((item, index) => {
                return {
                  value: pidItem.values[index].value,
                  label: item.label
                };
              })}
            />
          );
        }}
      </FCConfigContext.Consumer>
    );
  }
};

PidProcessDenom.propTypes = {
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

export default withStyles(styles)(injectIntl(PidProcessDenom));

import React, { Component } from "react";
import Typography from "@material-ui/core/Typography";
import CircularProgress from "@material-ui/core/CircularProgress";
import { FormattedMessage } from "react-intl";

export default class SavingIndicator extends Component {
  render() {
    return (
      <div style={{ display: "flex" }}>
        <CircularProgress
          className="flex-column-center"
          style={{
            margin: 10
          }}
          color="secondary"
          thickness={7}
        />
        <Typography style={{ flexGrow: 1 }}>
          <FormattedMessage id="common.saving" />
        </Typography>
      </div>
    );
  }
}

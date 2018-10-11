import React, { Component } from "react";
import {
  Select,
  Paper,
  Button,
  FormControl,
  InputLabel,
  MenuItem
} from "@material-ui/core";
import FcBackup from "../../utilities/FcBackup";
import { FormattedMessage } from "react-intl";

export default class BackupsList extends Component {
  state = {
    list: [],
    selected: ""
  };
  componentDidMount() {
    this.setState({ list: FcBackup.list() });
  }
  render() {
    return this.state.list.length ? (
      <Paper
        elevation={3}
        style={{
          display: "flex",
          justifyItems: "center",
          alignItems: "center"
        }}
      >
        <Button
          color="primary"
          variant="raised"
          disabled={!this.state.selected}
          onClick={() => {
            this.props.onLoadBackup(FcBackup.load(this.state.selected));
          }}
        >
          <FormattedMessage id="backups.load" />
        </Button>
        <FormControl fullWidth style={{ margin: 10 }}>
          <InputLabel shrink htmlFor="backup-label-placeholder">
            <FormattedMessage id="backups.list" />
          </InputLabel>
          <Select
            value={this.state.selected}
            onChange={event => this.setState({ selected: event.target.value })}
            name={"backups.list"}
            inputProps={{
              id: "backup-label-placeholder",
              name: "backups.list"
            }}
          >
            {this.state.list &&
              this.state.list.map(item => {
                return (
                  <MenuItem key={item} value={item}>
                    {item}
                  </MenuItem>
                );
              })}
          </Select>
        </FormControl>
      </Paper>
    ) : (
      ""
    );
  }
}

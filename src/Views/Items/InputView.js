import React, { Component } from "react";
import TextField from "@material-ui/core/TextField";
import FCConnector from "../../utilities/FCConnector";
import { injectIntl, intlShape, FormattedMessage } from "react-intl";

const InputView = class extends Component {
  constructor(props) {
    super(props);
    this.state = {
      current: props.item.current
    };
  }

  updateValue() {
    let isDirty = this.state.current !== this.props.item.current;
    if (isDirty) {
      this.props.item.current = this.state.current;
      this.setState({ isDirty: true });
      FCConnector.setValue(this.props.item.id, this.state.current).then(() => {
        this.props.notifyDirty(true, this.state, this.state.current);
        this.setState({ isDirty: false });
      });
    }
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (nextProps.item.current !== this.state.current) {
      this.setState({ current: nextProps.item.current });
    }
  }

  render() {
    if (this.props.name_type == "raw") {
      return (
        <TextField
          ref={this.props.inputRef}
          classes={{ root: this.props.item.id }}
          key={this.props.item.id}
          disabled={this.state.isDirty}
          helperText={
            this.props.intl.messages[`${this.props.id}.helper`] && (
              <FormattedMessage id={`${this.props.id}.helper`} />
            )
          }
          label={<p>{this.props.item.id}</p>}
          value={this.state.current}
          onBlur={() => this.updateValue()}
          onKeyPress={event => {
            if (event.key === "Enter") {
              event.target.blur();
            }
          }}
          onChange={event => {
            this.setState({ current: event.target.value });
          }}
          type={this.props.item.type || "number"}
        />
      );
    } else {
      return (
        <TextField
          ref={this.props.inputRef}
          classes={{ root: this.props.item.id }}
          key={this.props.item.id}
          disabled={this.state.isDirty}
          helperText={
            this.props.intl.messages[`${this.props.id}.helper`] && (
              <FormattedMessage id={`${this.props.id}.helper`} />
            )
          }
          label={
            <FormattedMessage
              style={{ whiteSpace: "nowrap" }}
              id={this.props.item.id}
            />
          }
          value={this.state.current}
          onBlur={() => this.updateValue()}
          onKeyPress={event => {
            if (event.key === "Enter") {
              event.target.blur();
            }
          }}
          onChange={event => {
            this.setState({ current: event.target.value });
          }}
          type={this.props.item.type || "number"}
        />
      );
    }
  }
};

InputView.propTypes = {
  intl: intlShape.isRequired
};

export default injectIntl(InputView);

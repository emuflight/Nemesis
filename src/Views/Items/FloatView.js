import React, { Component } from "react";
import TextField from "@material-ui/core/TextField";
import FCConnector from "../../utilities/FCConnector";
import { injectIntl, intlShape, FormattedMessage } from "react-intl";

const FloatView = class extends Component {
  constructor(props) {
    super(props);
    this.state = {
      current: props.item.current
    };
  }

  sanitizeInput = value => {
    if (value > this.props.max) {
      this.setState({ new: this.props.max });
    } else if (value < this.props.min) {
      this.setState({ new: this.props.min });
    } else {
      this.setState({ new: value });
    }
  };

  updateValue() {
    let isDirty = this.state.current !== this.props.item.current;
    if (isDirty) {
      this.setState({ isDirty: true });
      FCConnector.setValue(this.props.item.id, this.state.current).then(() => {
        this.props.notifyDirty(true, this.state, this.state.current);
        this.setState({ isDirty: false });
      });
    }
  }

  render() {
    return (
      <TextField
        classes={{ root: this.props.item.id }}
        key={this.props.item.id}
        disabled={this.state.isDirty}
        helperText={
          this.props.intl.messages[`${this.props.id}.helper`] && (
            <FormattedMessage id={`${this.props.id}.helper`} />
          )
        }
        label={<FormattedMessage id={this.props.item.id} />}
        value={(parseInt(this.props.item.current, 10) / 100).toFixed(2)}
        onBlur={() => this.updateValue()}
        onChange={event => {
          this.props.item.current = parseFloat(event.target.value) * 100;
          this.setState({ current: this.props.item.current });
        }}
        inputProps={{
          step: "0.01",
          type: "number"
        }}
      />
    );
  }
};

FloatView.propTypes = {
  intl: intlShape.isRequired
};

export default injectIntl(FloatView);

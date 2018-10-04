import React, { Component } from "react";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import Input from "@material-ui/core/Input";
import FormHelperText from "@material-ui/core/FormHelperText";
import MaskedInput from "react-text-mask";
import FCConnector from "../../utilities/FCConnector";
import { injectIntl, intlShape, FormattedMessage } from "react-intl";

function TextMaskCustom(props) {
  const { inputRef, ...other } = props;

  return (
    <MaskedInput
      {...other}
      ref={inputRef}
      mask={[/\d/, ".", /\d/, /\d/]}
      keepCharPositions
      guide={false}
    />
  );
}
const FloatView = class extends Component {
  constructor(props) {
    super(props);
    this.state = {
      current: props.item.current.padStart(3, "0")
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
    let current = parseInt(this.state.current.replace(".", ""), 10);
    let isDirty = parseInt(this.props.item.current, 10) !== current;
    if (isDirty) {
      this.props.item.current = current;
      this.setState({
        isDirty: true,
        current: current.toString().padStart(3, "0")
      });
      FCConnector.setValue(this.props.item.id, current).then(() => {
        this.props.notifyDirty(true, this.state, current);
        this.setState({ isDirty: false });
      });
    }
  }

  render() {
    return (
      <FormControl
        classes={{ root: this.props.item.id }}
        key={this.props.item.id}
      >
        <InputLabel htmlFor={this.props.item.id}>
          <FormattedMessage id={this.props.item.id} />
        </InputLabel>
        <Input
          id={this.props.item.id}
          disabled={this.state.isDirty}
          onChange={event => {
            this.setState({ current: event.target.value });
          }}
          onBlur={() => this.updateValue()}
          value={this.state.current}
          inputComponent={TextMaskCustom}
        />
        {this.props.intl.messages[`${this.props.id}.helper`] && (
          <FormHelperText>
            <FormattedMessage id={`${this.props.id}.helper`} />
          </FormHelperText>
        )}
      </FormControl>
    );
  }
};

FloatView.propTypes = {
  intl: intlShape.isRequired
};

export default injectIntl(FloatView);

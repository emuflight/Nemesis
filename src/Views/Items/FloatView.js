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
    this.floatPad = props.floatPad || 3;
    this.state = {
      floatPad: this.floatPad,
      current: props.item.current.padStart(this.floatPad, "0")
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.item.current !== this.state.current) {
      this.setState({
        current: nextProps.item.current.toString().padStart(this.floatPad, "0")
      });
    }
  }

  updateValue() {
    let current = parseInt(this.state.current.replace(".", ""), 10);
    let isDirty = parseInt(this.props.item.current, 10) !== current;
    if (isDirty) {
      this.props.item.current = current;
      this.setState({
        isDirty: true,
        current: current.toString().padStart(this.floatPad, "0")
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
        style={{ width: 90 }}
        classes={{ root: this.props.item.id }}
        key={this.props.item.id}
      >
        <InputLabel style={{ whiteSpace: "nowrap" }}>
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

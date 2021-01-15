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
      currentRaw: props.item.current,
      floatPad: this.floatPad,
      current: props.item.current
        .replace(".000", "")
        .padStart(this.floatPad, "0")
    };
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (nextProps.item.current !== this.state.currentRaw) {
      this.setState({
        currentRaw: nextProps.item.current,
        current: nextProps.item.current.toString().padStart(this.floatPad, "0")
      });
    }
  }

  updateValue() {
    let current = parseInt(this.state.current.padEnd(this.floatPad, "0"), 10);
    let isDirty = parseInt(this.props.item.current, 10) !== current;
    if (isDirty) {
      this.props.item.current = current;
      this.setState({
        isDirty: true,
        current: current.toString()
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
        <InputLabel style={{ whiteSpace: "nowrap" }} shrink={true}>
          <FormattedMessage id={this.props.item.id} />
        </InputLabel>
        <Input
          id={this.props.item.id}
          disabled={this.state.isDirty}
          onChange={event => {
            let val = event.target.value || "";
            this.setState({ current: val.replace(".", "") });
          }}
          onBlur={() => this.updateValue()}
          onKeyPress={event => {
            if (event.key === "Enter") {
              event.target.blur();
            }
          }}
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

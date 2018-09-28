import SliderView from "../Items/SliderView";

export default class TpaCurveItemView extends SliderView {
  constructor(props) {
    super(props);
    this.parser = parseInt;
    this.state = {
      isDirty: false,
      inputVal: this.props.item.current
    };
  }
  updateValue(newVal) {
    this.setState({ isDirty: true });
    this.props
      .updateCurve(newVal)
      .then(() => this.setState({ isDirty: false }));
  }
}

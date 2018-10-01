import SliderView from "../Items/SliderView";

export default class MotorSliderItemView extends SliderView {
  constructor(props) {
    super(props);
    this.parser = parseInt;
    this.state = {
      isDirty: false,
      inputVal: 1000
    };
  }
  updateValue(newVal) {
    this.setState({ isDirty: true });
    this.props
      .updateMotor(newVal)
      .then(() => this.setState({ isDirty: false }));
    // this.setState({ isDirty: false });
  }
}

import SliderView from "../Items/SliderView";

export default class TpaCurveItemView extends SliderView {
  constructor(props) {
    super(props);
    props.item.newValue = props.item.current;
    this.state = props.item;
    this.notifyDirty = props.notifyDirty;
    this.updateCurve = props.updateCurve;
  }
  updateValue() {
    this.updateCurve(this.state);
  }
}

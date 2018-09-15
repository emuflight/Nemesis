import DropdownView from "../Items/DropdownView";

export default class PidDenomView extends DropdownView {
  constructor(props) {
    super(props);
    this.state = props.item;
    this.notifyDirty = props.notifyDirty;
  }
  updateValues(values, newValue) {
    let offset = 0;
    values.forEach((v, i) => {
      if (v.value === newValue) {
        offset = i;
      }
    });
    this.setState({
      values: values.slice(offset).map((item, index) => {
        console.log(this.originalValues[index].value);
        return {
          value: this.originalValues[index].value,
          label: item.label
        };
      })
    });
  }
  componentDidMount() {
    this.originalValues = this.state.values;
    this.GyroDropdown = document.getElementById("gyro_sync_denom");
    this.updateValues(
      this.GyroDropdown.$state.values,
      this.GyroDropdown.$state.current
    );
    this.GyroDropdown.addEventListener("change", event => {
      this.updateValues(event.detail.item.values, event.detail.newValue);
    });
  }
}

import DfuView from "./DfuView";
import FCConnector from "../utilities/FCConnector";

export default class ImufView extends DfuView {
  constructor(props) {
    super(props);
    this.title = "IMU-F Updater";
    this.flText = "Select a version to flash IMU-F";
    this.btnLabel = "Update";
    this.state = {
      items: props.firmwares,
      current: props.firmwares[0].url,
      note: props.firmwares[0].note,
      isFlashing: false
    };
  }

  handleFlash() {
    this.setState({ isFlashing: true });
    FCConnector.flashIMUF(this.state.current, progress => {
      this.setState({ progress });
    }).then(done => {
      this.setState({ isFlashing: false, note: done });
    });
  }
}

import DfuView from "./DfuView";
import FCConnector from "../utilities/FCConnector";

const IMUFMessage = `\n\n**********<h1>YOU ARE IN IMU-F UPDATE MODE.\nDO NOT UNPLUG YOUR DEVICE UNTIL UPDATE IS COMPLETE OR YOU'RE GONNA HAVE A BAD TIME.</h1><img id="pbjt" src="assets/teehee.png" height="90" width="90"/><br/>**********\n\n`;

export default class ImufView extends DfuView {
  constructor(props) {
    super(props);
    this.title = "IMU-F Updater";
    this.flText = "Select a version to flash IMU-F";
    this.btnLabel = "Update";
    this.cliNotice = IMUFMessage;
    this.state = {
      currentTarget: "IMU-F",
      current: "IMU-F",
      progress: "",
      hasTarget: true,
      allowUpload: false,
      targetItems: ["IMU-F"]
    };
  }
  get releasesKey() {
    return "imufReleases";
  }
  get releaseUrl() {
    return "https://api.github.com/repos/heliorc/imuf-release-dev/contents";
  }

  get releaseNotesUrl() {
    return "https://raw.githubusercontent.com/heliorc/imuf-release/master/CHANGELOG.md";
  }

  setFirmware(data) {
    let firmwares = data.reverse().filter(file => file.name.endsWith(".bin"));
    this.setState({
      items: firmwares,
      current: firmwares[0].download_url,
      isFlashing: false
    });
  }
  handleFlash() {
    this.refs.cliView.setState({ open: true, stayOpen: true, disabled: true });
    this.setState({ isFlashing: true });
    FCConnector.flashIMUF(this.state.current, progress => {
      this.setState({ progress });
    }).then(done => {
      this.setState({ isFlashing: false, note: done });
    });
  }
}

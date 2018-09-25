import DfuView from "./DfuView";
import FCConnector from "../utilities/FCConnector";

export default class ImufView extends DfuView {
  constructor(props) {
    super(props);
    this.title = "IMU-F Updater";
    this.flText = "Select a version to flash IMU-F";
    this.btnLabel = "Update";
    this.state = {};
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
    let firmwares = data
      .reverse()
      .filter(file => file.name.endsWith(".bin"))
      .map(file => {
        file.note =
          "See the release notes here: https://github.com/heliorc/imuf-release/blob/master/CHANGELOG.md";
        return file;
      });
    this.setState({
      items: firmwares,
      current: firmwares[0].download_url,
      note: firmwares[0].note,
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

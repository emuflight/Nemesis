import React, { Component } from "react";
import SelectField from "material-ui/SelectField";
import MenuItem from "material-ui/MenuItem";
import RaisedButton from "material-ui/RaisedButton";
import Paper from "material-ui/Paper";
import FCConnector from "../utilities/FCConnector";
import CliView from "./CliView/CliView";
import ReactMarkdown from "react-markdown";

export default class DfuView extends Component {
  constructor(props) {
    super(props);
    this.title = this.flText = "Select a firmware to flash";
    this.btnLabel = "Update";
    this.state = {};

    FCConnector.webSockets.addEventListener("message", message => {
      try {
        let notification = JSON.parse(message.data);
        this.refs.cliView.setCliBuffer(notification.progress);
      } catch (ex) {
        console.warn(ex);
      }
    });
  }

  handleFlash() {
    this.refs.cliView.setState({ open: true, stayOpen: true, disabled: true });
    this.setState({ isFlashing: true });
    FCConnector.flashDFU(this.state.current, progress => {
      this.setState({ progress });
    }).then(done => {
      this.setState({ isFlashing: false, note: done });
    });
  }
  get releasesKey() {
    return "firmwareReleases";
  }
  get releaseUrl() {
    return "https://api.github.com/repos/heliorc/imuf-release/contents";
  }

  get releaseNotesUrl() {
    return "https://github.com/ButterFlight/butterflight/releases";
  }

  setFirmware(data) {
    let firmwares = data
      .filter(file => file.name.endsWith(".hex"))
      .map(file => {
        file.name = file.name.replace("_MSD_1.0.0_IMUF", " IMU-F");
        file.note =
          "Release notes: https://github.com/ButterFlight/butterflight/releases";
        return file;
      });
    this.setState({
      items: firmwares,
      current: firmwares[0].url,
      note: firmwares[0].note,
      isFlashing: false
    });
  }

  fetchReleases() {
    return fetch(this.releaseUrl)
      .then(response => response.json())
      .then(releases => {
        localStorage.setItem(
          this.releasesKey + "Expires",
          new Date().getTime() + 1 * 24 * 60 * 60 * 1000
        );
        localStorage.setItem(this.releasesKey, JSON.stringify(releases));
        this.setFirmware(releases);
        return releases;
      });
  }

  componentDidMount() {
    fetch(this.releaseNotesUrl)
      .then(response => response.arrayBuffer())
      .then(notes => {
        let note = new TextDecoder("utf-8").decode(notes);
        this.setState({ note });
      });
    let cachedReleases = localStorage.getItem(this.releasesKey);
    if (cachedReleases) {
      let expiry = new Date(
        parseInt(localStorage.getItem(this.releasesKey + "Expires"), 10)
      ).getTime();
      if (new Date().getTime() < expiry) {
        console.log("using cached release information");
        return this.setFirmware(JSON.parse(cachedReleases));
      }
    }

    this.fetchReleases();
  }

  render() {
    return (
      <Paper
        style={{
          display: "flex",
          flexDirection: "column",
          position: "relative",
          flex: "1",
          padding: "10px",
          minHeight: "100%"
        }}
      >
        <p>{this.title}</p>
        <SelectField
          autoWidth={true}
          floatingLabelText={this.flText}
          value={this.state.current}
          disabled={this.state.isFlashing}
          onChange={(event, key, payload) => {
            this.setState({ current: payload });
          }}
        >
          {this.state.items &&
            this.state.items.map((fw, index) => {
              return (
                <MenuItem key={index} primaryText={fw.name} value={fw.url} />
              );
            })}
        </SelectField>
        <RaisedButton
          style={{ margin: "20px" }}
          primary={true}
          onClick={() => this.handleFlash()}
          disabled={this.state.isFlashing}
          label={this.btnLabel}
        />
        <Paper zDepth={3} style={{ margin: "10px", padding: "10px" }}>
          <ReactMarkdown source={this.state.note} />
        </Paper>
        <CliView ref="cliView" />
      </Paper>
    );
  }
}

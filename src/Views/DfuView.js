import React, { Component } from "react";
import Button from "@material-ui/core/Button";
import Paper from "@material-ui/core/Paper";
import FCConnector from "../utilities/FCConnector";
import CliView from "./CliView/CliView";
import ReactMarkdown from "react-markdown";
import HelperSelect from "./Items/HelperSelect";
import theme from "../Themes/Dark";
import Typography from "@material-ui/core/Typography";

export default class DfuView extends Component {
  constructor(props) {
    super(props);
    this.title = this.flText = "Select a firmware to flash";
    this.btnLabel = "FLASH";
    this.state = {
      current: "",
      progress: ""
    };
    let isProgressStarted = false;
    FCConnector.webSockets.addEventListener("message", message => {
      try {
        let notification = JSON.parse(message.data);
        if (notification.progress) {
          let haspercent = notification.progress.indexOf("%") > -1;
          if (isProgressStarted && haspercent) {
            this.refs.cliView.replaceLine(
              /Download\s+\[.+\n/gim,
              notification.progress
            );
          } else {
            isProgressStarted = haspercent;
            this.refs.cliView.appendCliBuffer(notification.progress || "");
          }
        }
      } catch (ex) {
        console.warn(ex);
      }
    });

    this.goBack = props.goBack;
  }

  handleFlash() {
    this.refs.cliView.setState({ open: true, stayOpen: true, disabled: true });
    this.setState({ isFlashing: true });
    FCConnector.flashDFU(this.state.current, progress => {
      this.setState({ progress });
    })
      .then(done => {
        this.setState({ isFlashing: false, note: done });
      })
      .catch(error => {
        this.setState({ progress: "Unable to load file" });
        localStorage.clear();
      });
  }
  get releasesKey() {
    return "firmwareReleases";
  }
  get releaseUrl() {
    return "https://api.github.com/repos/heliorc/imuf_dev_repo/contents";
  }

  get releaseNotesUrl() {
    return "https://raw.githubusercontent.com/ButterFlight/butterflight/master/README.md";
  }

  setFirmware(data) {
    let firmwares = data
      .filter(
        file => file.name.endsWith(".bin") && !file.name.startsWith("IMUF")
      )
      .map(file => {
        file.note =
          "Release notes: https://github.com/ButterFlight/butterflight/releases";
        return file;
      })
      .reverse();
    this.setState({
      items: firmwares,
      current: firmwares[0].download_url,
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
          padding: "30px 10px 10px 10px",
          minHeight: "100%",
          boxSizing: "border-box"
        }}
      >
        <div style={{ display: "flex" }}>
          <Typography paragraph variant="title">
            {this.title}
          </Typography>
          <div style={{ flexGrow: 1 }} />
          {this.props.goBack && (
            <Button color="primary" onClick={this.props.goBack}>
              Go Back
            </Button>
          )}
        </div>
        <HelperSelect
          label={this.flText}
          value={this.state.current}
          disabled={this.state.isFlashing}
          onChange={event => {
            this.setState({ current: event.target.value });
          }}
          items={
            this.state.items &&
            this.state.items.map(fw => {
              return {
                value: fw.download_url,
                label: fw.name
              };
            })
          }
        />
        <Button
          style={{ margin: "20px" }}
          color="primary"
          variant="contained"
          onClick={() => this.handleFlash()}
          disabled={this.state.isFlashing}
        >
          {this.btnLabel}
        </Button>
        <Paper
          theme={theme}
          elevation={3}
          style={{ margin: "10px", padding: "10px" }}
        >
          <Typography>
            <ReactMarkdown source={this.state.note} classNames={theme} />
          </Typography>
        </Paper>
        <CliView ref="cliView" />
      </Paper>
    );
  }
}

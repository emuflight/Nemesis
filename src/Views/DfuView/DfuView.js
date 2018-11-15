import React, { Component } from "react";
import Button from "@material-ui/core/Button";
import Paper from "@material-ui/core/Paper";
import Input from "@material-ui/core/Input";
import FCConnector from "../../utilities/FCConnector";
import CliView from "../CliView/CliView";
import ReactMarkdown from "react-markdown";
import HelperSelect from "../Items/HelperSelect";
import Typography from "@material-ui/core/Typography";
import { FormattedMessage } from "react-intl";
import { FormControlLabel, FormGroup, Switch } from "@material-ui/core";
import "./DfuView.css";

const releaseUrls = {
  ButterFlight:
    "https://api.github.com/repos/ButterFlight/Butterflight/releases/latest",
  RACEFLIGHT: "https://api.github.com/repos/orneryd/omg/releases/latest",
  Betaflight:
    "https://api.github.com/repos/heliorc/imuf-release-bef/releases/latest"
};
const releaseNotesUrls = {
  ButterFlight:
    "https://raw.githubusercontent.com/ButterFlight/butterflight/3.6.2/README.md",
  RACEFLIGHT: "https://raw.githubusercontent.com/orneryd/omg/v3.0.33/README.md",
  Betaflight:
    "https://raw.githubusercontent.com/Betaflight/Betaflight/3.5.2/README.md"
};
export default class DfuView extends Component {
  constructor(props) {
    super(props);
    this.cliNotice =
      '\n\n**********<h1>YOU ARE IN DFU MODE.\nDO NOT UNPLUG YOUR DEVICE UNTIL FLASHING IS COMPLETE OR YOU\'RE GONNA HAVE A BAD TIME.</h1><img id="pbjt" src="assets/dfu.gif" height="90" width="90"/><br/>#flyhelio\n**********\n\n';
    this.state = {
      theme: props.theme,
      allowUpload: true,
      chipErase: false,
      selectedFile: undefined,
      current: "",
      currentTarget: props.target || "",
      firmwareType: props.firmware || "RACEFLIGHT",
      firmwareTypeList: ["RACEFLIGHT", "ButterFlight", "Betaflight"],
      progress: "",
      firmwares: {}
    };
    let isProgressStarted = false;
    FCConnector.webSockets.addEventListener("message", message => {
      try {
        let notification = JSON.parse(message.data);
        if (notification.progress) {
          if (!this.refs.cliView.state.open) {
            this.setState({ isFlashing: true });
            this.refs.cliView.setState({ open: true });
          }
          let idxprct = notification.progress.indexOf("%");
          let haspercent = idxprct > -1;
          if (isProgressStarted && haspercent) {
            // let pct = parseInt(notification.progress.slice(idxprct - 3, idxprct), 10);
            // document.getElementById('pbjt').style.transform = `translateX(${pct})`;
            this.refs.cliView.replaceLast(
              this.cliNotice + notification.progress
            );
          } else {
            isProgressStarted = haspercent;
            this.refs.cliView.appendCliBuffer(notification.progress);
          }
        }
      } catch (ex) {
        console.warn(ex);
      }
    });

    this.goBack = props.goBack;
  }
  loadLocalFile = event => {
    var data = new FormData();
    data.append("bin", event.target.files[0]);
    this.setState({ currentTarget: "", selectedFile: data });
  };

  handleFlash() {
    this.refs.cliView.setState({ open: true, stayOpen: true, disabled: true });
    this.setState({ isFlashing: true });
    let promise;
    if (this.state.selectedFile) {
      promise = FCConnector.flashDFULocal(
        this.state.selectedFile,
        this.state.chipErase
      );
    } else {
      promise = FCConnector.flashDFU(this.state.current, this.state.chipErase);
    }
    promise
      .then(done => {
        this.setState({ isFlashing: false, note: done });
      })
      .catch(error => {
        this.setState({ progress: "Unable to load file" });
        localStorage.clear();
      });
  }
  get releasesKey() {
    return `${this.state.firmwareType}.releases`;
  }
  get releaseUrl() {
    return releaseUrls[this.state.firmwareType];
  }

  get releaseNotesUrl() {
    return releaseNotesUrls[this.state.firmwareType];
  }

  targetRegex = /.*_(\w+)\.bin/;

  setFirmware(data) {
    let targetList = [];
    let assets = data.assets || data;
    let firmwares = assets
      .filter(file => {
        return file.name.endsWith(".bin") && !file.name.startsWith("IMUF");
      })
      .reduce((reducer, file) => {
        file.download_url = file.download_url || file.browser_download_url;
        let match = file.name.match(this.targetRegex);
        if (match && match[1]) {
          let targetName = match[1];
          reducer[targetName] = reducer[targetName] || [];
          reducer[targetName].push(file);
          if (targetList.indexOf(targetName) < 0) {
            targetList.push(targetName);
          }
        }
        return reducer;
      }, {});
    targetList.sort();
    this.setState({
      firmwares: firmwares,
      targetList: targetList,
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
  loadReleaseNotes() {
    fetch(this.releaseNotesUrl)
      .then(response => response.arrayBuffer())
      .then(notes => {
        let note = new TextDecoder("utf-8").decode(notes);
        this.setState({ note });
      });
  }
  loadReleases() {
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

  componentDidMount() {
    this.loadReleaseNotes();
    this.loadReleases();
  }

  render() {
    return (
      <Paper className="dfu-view-root">
        {this.state.firmwareTypeList && (
          <HelperSelect
            labelClassName="dfu-select-firmware"
            label="dfu.target.firmware-type"
            value={this.state.firmwareType}
            disabled={this.state.isFlashing}
            onChange={event => {
              this.setState({ firmwareType: event.target.value }, () => {
                this.loadReleaseNotes();
                this.loadReleases();
              });
            }}
            items={
              this.state.firmwareTypeList &&
              this.state.firmwareTypeList.map(target => {
                return {
                  value: target,
                  label: target
                };
              })
            }
          />
        )}
        <div style={{ display: "flex" }}>
          <Typography paragraph variant="h6">
            <FormattedMessage id="dfu.select.version" />
          </Typography>
          <div style={{ flexGrow: 1 }} />
          {this.props.goBack && (
            <Button color="primary" onClick={this.props.goBack}>
              <FormattedMessage id="common.go-back" />
            </Button>
          )}
        </div>
        <div style={{ display: "flex" }}>
          <HelperSelect
            style={{ flex: 1 }}
            label="dfu.target.title"
            value={this.state.currentTarget}
            disabled={this.state.isFlashing || !!this.state.selectedFile}
            onChange={event => {
              this.setState({ currentTarget: event.target.value });
            }}
            items={
              this.state.targetList &&
              this.state.targetList.map(target => {
                return {
                  value: target,
                  label: target || "Choose One..."
                };
              })
            }
          />
          {this.state.allowUpload && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                padding: "0 8px 0 0"
              }}
            >
              <Typography>
                <FormattedMessage id="common.or" />
              </Typography>
            </div>
          )}
          {this.state.allowUpload && (
            <Input
              style={{ flex: 1, marginBottom: 8 }}
              type="file"
              name="fileUpload"
              inputProps={{
                accept: "bin"
              }}
              onChange={event => this.loadLocalFile(event)}
            />
          )}
        </div>
        {this.state.currentTarget && (
          <HelperSelect
            label="dfu.select.version"
            value={this.state.current}
            disabled={this.state.isFlashing || !!this.state.selectedFile}
            onChange={event => {
              this.setState({ current: event.target.value });
            }}
            items={
              this.state.firmwares[this.state.currentTarget] &&
              this.state.firmwares[this.state.currentTarget].map(fw => {
                return {
                  value: fw.download_url || "",
                  label: fw.name || "Choose One..."
                };
              })
            }
          />
        )}
        <div className="flex-center">
          {this.state.currentTarget !== "IMU-F" && (
            <FormGroup component="fieldset" style={{ paddingLeft: 10 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={this.state.chipErase}
                    onChange={(event, chipErase) =>
                      this.setState({ chipErase })
                    }
                  />
                }
                label={<FormattedMessage id="dfu.full-erase" />}
              />
            </FormGroup>
          )}
          <Button
            style={{ margin: "20px", flex: 1 }}
            color="primary"
            variant="contained"
            onClick={() => this.handleFlash()}
            disabled={
              this.state.isFlashing ||
              (!this.state.current && !this.state.selectedFile)
            }
          >
            <FormattedMessage id="common.flash" />
          </Button>
        </div>
        <Paper>
          <Typography>
            <ReactMarkdown
              source={this.state.note}
              classNames={this.state.theme}
            />
          </Typography>
        </Paper>
        <CliView disabled={true} startText={this.cliNotice} ref="cliView" />
      </Paper>
    );
  }
}

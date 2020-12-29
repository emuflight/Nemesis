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

export default class DfuView extends Component {
  constructor(props) {
    super(props);
    this.cliNotice =
      '\n\n**********<h1>YOU ARE IN DFU MODE.\nDO NOT UNPLUG YOUR DEVICE UNTIL FLASHING IS COMPLETE OR YOU\'RE GONNA HAVE A BAD TIME.</h1><img id="pbjt" src="assets/dfu.gif" height="90" width="90"/><br/>#flashEmu\n**********\n\n';
    this.state = {
      theme: props.theme,
      allowUpload: true,
      chipErase: true,
      selectedFile: undefined,
      selectedUrl: undefined,
      current: "",
      currentTarget: props.target || "",
      currentRelease: props.release || "",
      firmwareType: props.firmware || "EmuFlight",
      firmwareTypeList: ["EmuFlight"],
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
    this.setState({ currentTarget: "", selectedUrl: null });
  };

  handleFlash() {
    this.refs.cliView.setState({ open: true, stayOpen: true, disabled: true });
    this.setState({ isFlashing: true });
    let promise;
    if (this.state.selectedFile && this.state.selectedFile != null) {
      promise = FCConnector.flashDFULocal(
        this.state.selectedFile,
        this.state.chipErase
      );
    } else {
      promise = FCConnector.flashDFU(
        this.state.selectedUrl,
        this.state.chipErase
      );
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

  releaseUrl() {
    return "https://api.github.com/repos/emuflight/EmuFlight/releases";
  }

  fetchReleases() {
    return fetch(this.releaseUrl())
      .then(response => response.json())
      .then(releaseList => {
        releaseList.forEach(function(release) {
          release.assets.forEach(function(target) {
            target.label = target.name
              .split(".hex")[0]
              .split("_")
              .slice(2)
              .join("_");
          });
        });
        let latestRelease = releaseList[0];
        console.log("latest release:", latestRelease);
        this.setState({ releaseList: releaseList });
        this.setState({ currentRelease: latestRelease }); // select latest release in select box

        if (this.props.version) {
          // select autodetected FC target if it has been detected
          let autodetect_target =
            latestRelease.assets.find(element => {
              return element.label === this.props.version.target;
            }) || undefined;
          if (autodetect_target) {
            this.setState({ currentTarget: autodetect_target });
            this.setState({
              selectedUrl: autodetect_target.browser_download_url || undefined
            });
          }
        }
        /*
        // TODO: Set this to cache releaseList instead of firmware, since all data is in releaseList
        data.map(release => {
          localStorage.setItem(
            this.releaseKey + "Expires",
            new Date().getTime() + 1 * 24 * 60 * 60 * 1000
          );
          localStorage.setItem(this.releasesKey, JSON.stringify(releases));
          this.setFirmware(releases);
          return release;
        });
        */
      });
  }
  loadReleases() {
    let cachedReleases = localStorage.getItem(this.releasesKey);
    // TEMP disable cached releases
    cachedReleases = false;

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
    this.setState({ firmwareType: "EmuFlight" }, () => {
      this.loadReleases();
    });
  }

  render() {
    return (
      <Paper className="dfu-view-root">
        <div style={{ display: "flex" }}>
          <Typography paragraph variant="h6">
            {this.state.currentTarget !== "IMU-F" && (
              <FormattedMessage id="dfu.flash.title" />
            )}
            {this.state.currentTarget === "IMU-F" && (
              <FormattedMessage id="imuf.title" />
            )}
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
            label="dfu.release.title"
            value={this.state.currentRelease}
            disabled={this.state.isFlashing}
            onChange={event => {
              this.setState({ currentRelease: event.target.value });
              this.setState({ selectedUrl: null });
              this.setState({ selectedFile: null });
            }}
            items={
              this.state.releaseList &&
              this.state.releaseList.map(release => {
                return {
                  value: release,
                  label: release.tag_name || "Choose One..."
                };
              })
            }
          />
        </div>
        <div style={{ display: "flex" }}>
          {this.state.currentTarget !== "IMU-F" && (
            <HelperSelect
              style={{ flex: 1 }}
              label="dfu.target.title"
              value={this.state.currentTarget}
              disabled={this.state.isFlashing}
              onChange={event => {
                this.setState({ currentTarget: event.target.value });
                this.setState({
                  selectedUrl: event.target.value.browser_download_url
                });
                this.setState({ selectedFile: null });
              }}
              items={
                this.state.currentRelease &&
                this.state.currentRelease.assets.map(target => {
                  return {
                    value: target,
                    label: target.label || "Choose One..."
                  };
                })
              }
            />
          )}
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
              (!this.state.current &&
                (!this.state.selectedFile && !this.state.selectedUrl))
            }
          >
            <FormattedMessage id="common.flash" />
          </Button>
        </div>
        <Paper>
          {this.state.currentTarget === "IMU-F" && (
            <Typography style={{ "max-height": "60vh", overflow: "auto" }}>
              <ReactMarkdown
                source={this.state.currentRelease.body}
                classNames={this.state.theme}
              />
            </Typography>
          )}
        </Paper>
        <CliView disabled={true} startText={this.cliNotice} ref="cliView" />
      </Paper>
    );
  }
}

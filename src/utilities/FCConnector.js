export default new class FCConnector {
  serviceUrl = `http://${window.location.hostname}:9001`;
  startDetect(onFcConnect) {
    this.webSockets = new WebSocket(`ws://${window.location.hostname}:9002`);

    this.webSockets.addEventListener("open", () => {
      console.log("opened");
    });

    this.webSockets.addEventListener("error", error => {
      console.warn(error);
    });

    this.webSockets.addEventListener("message", message => {
      let data = {};
      try {
        data = JSON.parse(message.data);
      } catch (ex) {
        console.warn("unable to parse connection message:", ex);
      }
      if (!data.telemetry) {
        onFcConnect(data);
      }
    });
  }

  tryGetConfig() {
    return fetch(`${this.serviceUrl}/device`).then(response => {
      return response.json();
    });
  }

  changeProfile(profileName, index) {
    return fetch(`${this.serviceUrl}/profile/${profileName}/${index}`);
  }

  setValue(name, newValue) {
    return fetch(`${this.serviceUrl}/set/${name}/${newValue}`).then(
      response => {
        return response.arrayBuffer();
      }
    );
  }

  sendCommand(commandToSend) {
    return fetch(
      `${this.serviceUrl}/send/${encodeURIComponent(commandToSend)}`
    );
  }

  sendCliCommand(command) {
    return this.sendCommand(command).then(response => {
      return response.text();
    });
  }

  sendBulkCommands(commands, progress) {
    return new Promise((resolve, reject) => {
      const sendNext = com => {
        this.sendCliCommand(com)
          .catch(err => {
            console.log(err);
            reject(err);
          })
          .then(resp => {
            progress && progress(resp);
            if (commands.length) {
              sendNext(commands.shift());
            } else {
              resolve();
            }
          });
      };
      sendNext(commands.shift());
    });
  }
  saveConfig() {
    return this.sendCommand("save");
  }
  getMotors() {
    return fetch(`${this.serviceUrl}/motors`).then(response => response.json());
  }
  remapMotor(from, to) {
    return fetch(`${this.serviceUrl}/remap/${from}/${to}`).then(resp => {
      return resp.text();
    });
  }
  spinTestMotor(motor, value) {
    return fetch(`${this.serviceUrl}/spintest/${motor}/${value}`).then(resp => {
      return resp.text();
    });
  }
  getChannelMap() {
    return fetch(`${this.serviceUrl}/channelmap`).then(response =>
      response.text()
    );
  }
  setChannelMap(newMap) {
    return fetch(`${this.serviceUrl}/channelmap/${newMap}`);
  }
  goToDFU(target) {
    this.currentTarget = target;
    return fetch(`${this.serviceUrl}/dfu`);
  }

  getAssistant(type, fw) {
    return fetch(`${this.serviceUrl}/assistant/${fw}/${type}`).then(resp =>
      resp.json()
    );
  }
  saveEEPROM() {
    return fetch(`${this.serviceUrl}/save/eeprom`);
  }
  getModes() {
    return fetch(`${this.serviceUrl}/modes`).then(resp => {
      return resp.json();
    });
  }
  setMode(state) {
    let modeVals = `${state.id}|${state.mode}|${state.channel}|${
      state.range[0]
    }|${state.range[1]}|0`;
    return fetch(`${this.serviceUrl}/modes/${modeVals}`).then(resp => {
      return resp.text();
    });
  }

  startTelemetry(type = "status") {
    this.lastTelemetry = type;
    return fetch(`${this.serviceUrl}/telem/${this.lastTelemetry}/start`);
  }
  pauseTelemetry() {
    this.paused = true;
    this.stopTelemetry();
  }
  resumeTelemetry() {
    if (this.paused && this.lastTelemetry) {
      this.paused = false;
      return fetch(`${this.serviceUrl}/telem/${this.lastTelemetry}/start`);
    }
  }
  storage(command = "info") {
    return fetch(`${this.serviceUrl}/storage/${command}`).then(res =>
      res.json()
    );
  }

  getTpaCurves(profile) {
    return fetch(`${this.serviceUrl}/tpa/${profile}`).then(res => res.json());
  }

  setTpaCurves(pid, profile, newCurve) {
    return fetch(
      `${this.serviceUrl}/tpa/${pid}/${profile}/${encodeURIComponent(newCurve)}`
    );
  }
  stopTelemetry() {
    return fetch(`${this.serviceUrl}/telem/stop`);
  }

  uploadFont(name = "butterflight") {
    return fetch(`${this.serviceUrl}/font/${name}`);
  }

  flashDFU(binUrl, erase) {
    return fetch(
      `${this.serviceUrl}/flash/${encodeURIComponent(binUrl)}?erase=${erase}`
    ).then(response => {
      return response.json();
    });
  }

  flashDFULocal(binUrl, erase) {
    return fetch(`${this.serviceUrl}/flash?erase=${erase}`, {
      method: "POST",
      mode: "cors",
      body: binUrl
    }).then(response => {
      return response.json();
    });
  }

  flashIMUF(binUrl, notifyProgress) {
    return fetch(`${this.serviceUrl}/imuf/${encodeURIComponent(binUrl)}`).then(
      response => {
        return response.json();
      }
    );
  }
}();

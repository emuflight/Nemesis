export default new class FCConnector {
  serviceUrl = `http://${window.location.hostname}:9001`;
  lastTelemetry = [];
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
      if (data.connectionEvent) {
        onFcConnect(data);
      }
    });
  }

  tryGetConfig() {
    var self = this;
    return fetch(`${this.serviceUrl}/device`).then(response => {
      self.appVersion = response.headers.get("Pragma").split(" ")[1];
      console.log("tryGetConfig", self.appVersion);
      return response.json();
    });
  }

  changeProfile(profileName, index) {
    return fetch(`${this.serviceUrl}/profile/${profileName}/${index}`);
  }

  setValue(name, newValue) {
    console.log("setValue", name, newValue);
    return fetch(`${this.serviceUrl}/set/${name}/${newValue}`).then(
      response => {
        return response.arrayBuffer();
      }
    );
  }

  sendCommand(commandToSend) {
    console.log("sendCommand", commandToSend);
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
              resolve(resp);
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
  goToDFU(version) {
    this.currentTarget = version.target;
    this.currentFirmware = version.fw;
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
  setMode(mapping) {
    //console.log("mapping: ", mapping);
    let modeVals = `${mapping.id}|${mapping.mode}|${mapping.channel}|${
      mapping.range[0]
    }|${mapping.range[1]}|0`;
    return fetch(`${this.serviceUrl}/modes/${modeVals}`).then(resp => {
      return resp.text();
    });
  }

  startTelemetry(type = "status") {
    console.log("Started telemetry: ", type);
    if (!this.lastTelemetry.includes(type)) {
      this.lastTelemetry.push(type); // save this telemetry type to resume after pause
    }
    return fetch(`${this.serviceUrl}/telem/${type}/start`);
  }
  pauseTelemetry() {
    this.paused = true;
    console.log("paused telemetry");
    // calling stop telemetry endpoint directly, because stopTelemetry() will also clear the paused telemetry list.
    // this is better behavior because pauseTelemetry() keeps the list intact. stopTelemetry() clears the list.
    return fetch(`${this.serviceUrl}/telem/stop`);
  }
  resumeTelemetry() {
    if (this.paused) {
      this.paused = false;
      for (var i = 0; i < this.lastTelemetry.length; i++) {
        fetch(`${this.serviceUrl}/telem/${this.lastTelemetry[i]}/start`);
      }
      return;
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
    this.lastTelemetry = ["status"]; //clear telemetry, leaving status only so resumeTelemetry() will not restart the types. we are done with the telemetry needed for the page
    return fetch(`${this.serviceUrl}/telem/stop`);
  }

  stopFastTelemetry() {
    this.lastTelemetry = ["status"]; //clear telemetry, leaving status only so resumeTelemetry() will not restart the types. we are done with the telemetry needed for the page
    return fetch(`${this.serviceUrl}/telem/stopFast`);
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

  flashIMUFLocal(binUrl, notifyProgress) {
    return fetch(`${this.serviceUrl}/imuf`, {
      method: "POST",
      mode: "cors",
      body: binUrl
    }).then(response => {
      return response.json();
    });
  }
}();

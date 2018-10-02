export default new class FCConnector {
  serviceUrl = "http://localhost:9001";
  startDetect(onFcConnect) {
    this.webSockets = new WebSocket("ws://127.0.0.1:9002");

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
      let response = "";
      let i = 1;
      const sendNext = com => {
        this.sendCliCommand(com)
          .catch(err => {
            console.log(err);
            reject(err);
          })
          .then(resp => {
            response += resp;
            progress && progress(i++);
            if (commands.length) {
              sendNext(commands.shift());
            } else {
              resolve(response);
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
  remapMotor(to, from) {
    return fetch(`${this.serviceUrl}/remap/${to}/${from}`);
  }
  spinTestMotor(motor, value) {
    return fetch(`${this.serviceUrl}/spintest/${motor}/${value}`);
  }
  getChannelMap() {
    return fetch(`${this.serviceUrl}/channelmap`).then(response =>
      response.json()
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

  startTelemetry(type = "gyro") {
    this.lastTelemetry = type;
    return fetch(`${this.serviceUrl}/telem/${this.lastTelemetry}/start`);
  }
  pauseTelemetry() {
    this.paused = true;
    this.stopTelemetry();
  }
  resumeTelemetry() {
    if (this.paused) {
      this.paused = false;
      return fetch(`${this.serviceUrl}/telem/${this.lastTelemetry}/start`);
    }
    return Promise.reject("not paused");
  }
  storage(command = "info") {
    return fetch(`${this.serviceUrl}/storage/${command}`).then(res =>
      res.json()
    );
  }

  stopTelemetry() {
    return fetch(`${this.serviceUrl}/telem/stop`);
  }

  uploadFont(name = "butterflight") {
    return fetch(`${this.serviceUrl}/font/${name}`);
  }

  flashDFU(binUrl) {
    return fetch(`${this.serviceUrl}/flash/${encodeURIComponent(binUrl)}`).then(
      response => {
        return response.json();
      }
    );
  }

  flashDFULocal(binUrl) {
    return fetch(`${this.serviceUrl}/flash`, {
      method: "POST", // *GET, POST, PUT, DELETE, etc.
      mode: "cors", // no-cors, cors, *same-origin
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

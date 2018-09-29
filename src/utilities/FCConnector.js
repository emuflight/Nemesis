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
  remapMotor(to, from) {
    return fetch(`${this.serviceUrl}/remap/${to}/${from}`);
  }
  spinTestMotor(motor, value) {
    return fetch(`${this.serviceUrl}/spintest/${motor}/${value}`);
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

  startTelemetry() {
    return fetch(`${this.serviceUrl}/telem/start`);
  }

  stopTelemetry() {
    return fetch(`${this.serviceUrl}/telem/stop`);
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

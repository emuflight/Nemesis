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
      return response.json();
    });
  }

  saveConfig() {
    return this.sendCommand("save");
  }

  goToDFU(target) {
    this.currentTarget = target;
    return fetch(`${this.serviceUrl}/dfu`);
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

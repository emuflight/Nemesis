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
      let data = JSON.parse(message.data);
      if (!data.telemetry) {
        console.log(data);
      } else {
        onFcConnect(data);
      }
    });
  }

  tryGetConfig() {
    return fetch(`${this.serviceUrl}/device`)
      .then(response => {
        return response.json();
      })
      .then(device => {
        if (device.config) {
          let versionParts = device.config.version.split("|");
          device.config.version = {
            fw: versionParts[0],
            target: versionParts[1],
            version: versionParts[3],
            imuf: device.config.imuf
          };
        }
        return device;
      });
  }

  setValue(name, newValue) {
    return fetch(`${this.serviceUrl}/set/${name}/${newValue}`).then(
      response => {
        return response.json();
      }
    );
  }

  sendCommand(commandToSend) {
    return fetch(
      `${this.serviceUrl}/send/${encodeURIComponent(commandToSend)}`
    );
  }

  saveConfig() {
    return this.sendCommand("save");
  }

  goToDFU() {
    return this.sendCommand("bl");
  }

  flashDFU(binUrl, notifyProgress) {
    return fetch(`${this.serviceUrl}/flash/${encodeURIComponent(binUrl)}`).then(
      response => {
        return response.json();
      }
    );
  }

  flashIMUF(binUrl, notifyProgress) {
    return fetch(`${this.serviceUrl}/imuf/${encodeURIComponent(binUrl)}`).then(
      response => {
        return response.json();
      }
    );
  }
}();

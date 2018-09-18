export default new class FCConnector {
  serviceUrl = "http://localhost:9001";
  startDetect(onFcConnect) {
    let connection = new WebSocket("ws://127.0.0.1:9002");

    connection.onopen = () => {
      console.log("opened");
    };

    connection.onerror = error => {
      console.warn(error);
    };

    connection.onmessage = message => {
      let data = JSON.parse(message.data);
      onFcConnect(data);
    };
  }

  tryGetConfig() {
    return fetch(`${this.serviceUrl}/device`)
      .then(response => {
        return response.json();
      })
      .then(device => {
        let versionParts = device.config.version.split("|");
        device.config.version = {
          fw: versionParts[0],
          target: versionParts[1],
          version: versionParts[3],
          imuf: device.config.imuf
        };
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

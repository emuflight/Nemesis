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
    return fetch(`${this.serviceUrl}/device`).then(response => {
      return response.json();
    });
  }

  setValue(name, newValue) {
    return fetch(`${this.serviceUrl}/set/${name}/${newValue}`).then(
      response => {
        return response.json();
      }
    );
  }

  saveConfig() {
    return fetch(`${this.serviceUrl}/send/save`).then(response => {
      return response.json();
    });
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

  goToDFU() {
    return fetch(`${this.serviceUrl}/send/bl`).then(response => {
      return response.json();
    });
  }
}();

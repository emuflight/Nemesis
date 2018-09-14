export default new class FCConnector {
  startDetect(onFcConnect) {
    let connection = new WebSocket("ws://127.0.0.1:9002");

    connection.onopen = () => {
      console.log("opened");
    };

    connection.onerror = error => {
      console.warn(error);
    };

    connection.onmessage = message => {
      onFcConnect(JSON.parse(message.data));
    };
  }

  tryGetConfig() {
    return fetch("http://localhost:9001/device").then(response => {
      return response.json();
    });
  }
  setConfig(item) {
    return fetch(
      `http://localhost:9001/set/${item.key}/${item.current}` + item
    ).then(response => {
      return response.json();
    });
  }
}();

const usb = require("usb");
const WebSocketServer = require("websocket").server;
const devices = require("./devices");
const http = require("http");

const server = http.createServer((request, response) => {
  // process HTTP request. Since we're writing just WebSockets
  // server we don't have to implement anything.
});

server.listen(9002, () => {});

// create the server
wsServer = new WebSocketServer({
  httpServer: server
});

let connectedDevice;
const clients = [];

// WebSocket server
wsServer.on("request", request => {
  var connection = request.accept(null, request.origin);
  clients.push(connection);
  // Detect add/insert
  usb.on(`attach`, device => {
    devices.list((err, ports) => {
      connectedDevice = ports[0];
      if (connectedDevice) {
        connectedDevice.connected = true;
        connection.sendUTF(JSON.stringify(connectedDevice));
      }
    });
  });

  // Detect remove
  usb.on(`detach`, device => {
    connection.sendUTF(
      JSON.stringify({
        dfu: false,
        connected: false,
        rebooting: !!connectedDevice.rebooting
      })
    );
  });
  // This is the most important callback for us, we'll handle
  // all messages from users here.
  connection.on("message", message => {});

  connection.on("close", connection => {});
});

const notifyProgress = data => {
  clients.forEach(client =>
    client.sendUTF(
      JSON.stringify({
        progress: data + "\n"
      })
    )
  );
};

const notifyTelem = telemetryData => {
  telemetryData.telemetry = true;
  clients.forEach(client => client.sendUTF(JSON.stringify(telemetryData)));
};

const deviceRebooting = deviceInfo => {
  if (connectedDevice) {
    connectedDevice.rebooting = deviceInfo;
  }
};

module.exports = {
  wsServer: wsServer,
  clients: clients,
  notifyProgress: notifyProgress,
  notifyTelem: notifyTelem,
  deviceRebooting: deviceRebooting
};

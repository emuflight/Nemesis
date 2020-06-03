const usb = require("usb");
const WebSocketServer = require("websocket").server;
const devices = require("./devices");
const http = require("http");
const STM32USB = require("./devices/STM32USB.json");
const bxf = require("./fcConnector/bxf");
//const rf1 = require("./fcConnector/rf1");

const server = http.createServer((request, response) => {
  // process HTTP request. Since we're writing just WebSockets
  // server we don't have to implement anything.
});

const cleanupConnections = () => {
  bxf.reset();
  //rf1.reset();
  clearInterval(wsServer.fastTelemetryInterval);
  clearInterval(wsServer.slowTelemetryInterval);
};
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
    if (device.deviceDescriptor.idVendor === STM32USB.vendorId) {
      clearInterval(wsServer.fastTelemetryInterval);
      clearInterval(wsServer.slowTelemetryInterval);
      devices.get((err, port) => {
        connectedDevice = port;
        if (connectedDevice) {
          //wait a little bit before sending the notification for slower machines.
          connectedDevice.connected = true;
          connectedDevice.connectionEvent = true;
          connection.sendUTF(JSON.stringify(connectedDevice));
        }
      });
    }
  });

  // Detect remove
  usb.on(`detach`, device => {
    if (device.deviceDescriptor.idVendor === STM32USB.vendorId) {
      cleanupConnections();
      connection.sendUTF(
        JSON.stringify({
          connectionEvent: true,
          dfu: false,
          connected: false
        })
      );
    }
  });
  // This is the most important callback for us, we'll handle
  // all messages from users here.
  connection.on("message", message => {});

  connection.on("close", connection => {
    clearInterval(wsServer.fastTelemetryInterval);
    clearInterval(wsServer.slowTelemetryInterval);
  });
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
  if (telemetryData) {
    telemetryData.telemetry = true;
    clients.forEach(client => client.sendUTF(JSON.stringify(telemetryData)));
  }
};

wsServer.fastTelemetryInterval;
wsServer.slowTelemetryInterval;
module.exports = {
  wsServer: wsServer,
  clients: clients,
  notifyProgress: notifyProgress,
  notifyTelem: notifyTelem,
  cleanup: cleanupConnections
};

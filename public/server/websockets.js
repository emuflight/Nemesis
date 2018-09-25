const usb = require("usb");
const WebSocketServer = require("websocket").server;
const devices = require("./devices");
const http = require("http");

const fcConnector = require("./fcConnector");

const server = http.createServer((request, response) => {
  // process HTTP request. Since we're writing just WebSockets
  // server we don't have to implement anything.
});

let connectedDevice;
let telemetry;

server.listen(9002, () => {});

// create the server
wsServer = new WebSocketServer({
  httpServer: server
});

const clients = [];

// WebSocket server
wsServer.on("request", request => {
  var connection = request.accept(null, request.origin);
  clients.push(connection);
  // Detect add/insert
  usb.on(`attach`, device => {
    setTimeout(() => {
      devices.list((err, ports) => {
        connectedDevice = ports[0];
        if (connectedDevice) {
          connectedDevice.connected = true;
          connection.sendUTF(JSON.stringify(connectedDevice));
        }
      });
    }, 1500);
  });

  // Detect remove
  usb.on(`detach`, device => {
    connection.sendUTF(
      JSON.stringify({
        dfu: false,
        connected: false
      })
    );
    // clearInterval(telemetry);
  });
  // This is the most important callback for us, we'll handle
  // all messages from users here.
  connection.on("message", message => {
    if (message.utf8Data === "startTelemetry") {
      // telemetry = setInterval(() => {
      //   fcConnector.getTelemetry(
      //     telemetryData => {
      //       telemetryData.telemetry = true;
      //       connection.sendUTF(JSON.stringify(telemetryData));
      //     }
      //   );
      // }, 150);
    }
  });

  connection.on("close", connection => {
    clearInterval(telemetry);
    clients.pop();
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

module.exports = {
  wsServer: wsServer,
  clients: clients,
  notifyProgress: notifyProgress
};

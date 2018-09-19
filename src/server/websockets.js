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

server.listen(9002, () => {});

// create the server
wsServer = new WebSocketServer({
  httpServer: server
});

// WebSocket server
wsServer.on("request", request => {
  var connection = request.accept(null, request.origin);
  // Detect add/insert
  usb.on(`attach`, device => {
    setTimeout(() => {
      devices.list((err, ports) => {
        connectedDevice = ports[0];
        if (connectedDevice) {
          connectedDevice.connected = true;
          if (connectedDevice.dfu) {
            connection.sendUTF(JSON.stringify(connectedDevice));
          } else {
            connection.sendUTF(JSON.stringify(connectedDevice));
            devices.setConnectedDevice(connectedDevice);
          }
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
    // fcConnector.close(devices.getConnectedDevice());
  });
  // This is the most important callback for us, we'll handle
  // all messages from users here.
  connection.on("message", message => {});

  connection.on("close", connection => {});
});

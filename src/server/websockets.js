const usbDetect = require("usb-detection");
const WebSocketServer = require("websocket").server;
const SerialPort = require("serialport");
const http = require("http");

const getfCConfig = require("./fcConfig");

const server = http.createServer((request, response) => {
  // process HTTP request. Since we're writing just WebSockets
  // server we don't have to implement anything.
});
server.listen(9002, () => {});

// create the server
wsServer = new WebSocketServer({
  httpServer: server
});

// WebSocket server
wsServer.on("request", request => {
  var connection = request.accept(null, request.origin);
  usbDetect.startMonitoring();
  // Detect add/insert
  usbDetect.on(`add`, device => {
    setTimeout(() => {
      SerialPort.list((err, ports) => {
        let connectedDevice = ports.filter(port => {
          return port.serialNumber === device.serialNumber;
        })[0];
        connectedDevice.connected = true;
        getfCConfig(connectedDevice.comName, config => {
          connectedDevice.config = config;
          connection.sendUTF(JSON.stringify(connectedDevice));
        });
      });
    }, 1000);
  });

  // Detect remove
  usbDetect.on(`remove`, device => {
    device.connected = false;
    connection.sendUTF(JSON.stringify(device));
  });
  // This is the most important callback for us, we'll handle
  // all messages from users here.
  connection.on("message", message => {});

  connection.on("close", connection => {
    usbDetect.stopMonitoring();
  });
});

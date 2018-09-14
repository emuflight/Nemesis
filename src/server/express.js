const express = require("express");
const devices = require("./devices");
const fcConnector = require("./fcConnector");
const app = express();
require("./websockets");

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

app.get("/device", (req, res) => {
  devices.list((err, ports) => {
    let connectedDevice = ports[0];
    if (connectedDevice) {
      fcConnector.getConfig(connectedDevice, config => {
        connectedDevice.config = config;
        res.json(connectedDevice);
      });
    } else {
      res.sendStatus(500);
    }
  });
});
app.get("/set/:param/:value", (req, res) => {
  devices.list((err, ports) => {
    let connectedDevice = ports[0];
    if (connectedDevice) {
      fcConnector.setValue(connectedDevice, config => {
        connectedDevice.config = config;
        res.json(connectedDevice);
      });
    } else {
      res.sendStatus(500);
    }
  });
});

app.listen(9001, () => console.log("usb interface listening on port 9001!"));

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
  res.header("Cache-Control", "private, no-cache, no-store, must-revalidate");
  res.header("Expires", "-1");
  res.header("Pragma", "no-cache");
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

app.get("/save", (req, res) => {
  devices.list((err, ports) => {
    let connectedDevice = ports[0];
    if (connectedDevice) {
      fcConnector.saveConfig(connectedDevice, () => {
        res.sendStatus(200);
      });
    } else {
      res.sendStatus(500);
    }
  });
});

app.get("/set/:name/:value", (req, res) => {
  devices.list((err, ports) => {
    let connectedDevice = ports[0];
    if (connectedDevice) {
      fcConnector.setValue(
        connectedDevice,
        req.params.name,
        req.params.value,
        config => {
          connectedDevice.config = config;
          res.json(connectedDevice);
        }
      );
    } else {
      res.sendStatus(500);
    }
  });
});

app.listen(9001, () => console.log("usb interface listening on port 9001!"));

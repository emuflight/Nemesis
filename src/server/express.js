const express = require("express");
const devices = require("./devices");
const fcConnector = require("./fcConnector");
const firmware = require("./firmware");
const imuf = require("./firmware/imuf");
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
      if (connectedDevice.dfu) {
        firmware.get(builds => {
          connectedDevice.firmwares = builds;
          res.json(connectedDevice);
        });
      } else {
        fcConnector.getConfig(connectedDevice, config => {
          if (config.version.indexOf("HESP") !== -1) {
            imuf.get(bins => {
              connectedDevice.config = config;
              connectedDevice.firmwares = bins;
              devices.setConnectedDevice(connectedDevice);
              res.json(connectedDevice);
            });
          } else {
            connectedDevice.config = config;
            devices.setConnectedDevice(connectedDevice);
            res.json(connectedDevice);
          }
        });
      }
    } else {
      res.sendStatus(500);
    }
  });
});

app.get("/send/:command", (req, res) => {
  devices.list((err, ports) => {
    let connectedDevice = ports[0];
    if (connectedDevice) {
      fcConnector.sendCommand(connectedDevice, req.params.command, output => {
        if (output) {
          res.json(output);
        } else {
          res.sendStatus(200);
        }
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
app.get("/flash/:binUrl", (req, res) => {
  firmware.flash(req.params.binUrl);
  res.sendStatus(202);
});

app.get("/imuf/:binUrl", (req, res) => {
  devices.list((err, ports) => {
    let connectedDevice = ports[0];
    if (connectedDevice) {
      fcConnector.updateIMUF(
        connectedDevice,
        req.params.binUrl,
        progress => {},
        complete => {}
      );
      res.sendStatus(202);
    }
  });
});

app.listen(9001, () => console.log("usb interface listening on port 9001!"));

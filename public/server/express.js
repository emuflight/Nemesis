const express = require("express");
const devices = require("./devices");
const fcConnector = require("./fcConnector");
const firmware = require("./firmware");
const app = express();
const websockets = require("./websockets");

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
        res.json(connectedDevice);
      } else {
        fcConnector.getConfig(
          connectedDevice,
          deviceConfig => {
            res.json(deviceConfig);
          },
          device => {
            res.status(426).send(device);
          }
        );
      }
    } else {
      res.sendStatus(404);
    }
  });
});

app.get("/send/:command", (req, res) => {
  devices.list((err, ports) => {
    let connectedDevice = ports[0];
    if (connectedDevice) {
      let command = req.params.command;
      console.log(command);
      fcConnector.sendCommand(
        connectedDevice,
        command,
        output => {
          if (output) {
            res.json(output);
          } else {
            res.sendStatus(202);
          }
        },
        err => {
          res.status(400).send(err);
        }
      );
    } else {
      res.sendStatus(404);
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
        },
        err => {
          res.status(400).send(err);
        }
      );
    } else {
      res.sendStatus(404);
    }
  });
});
app.get("/flash/:binUrl", (req, res) => {
  websockets.notifyProgress(`Fetching binary from ${req.params.binUrl}...\n`);
  firmware.load(req.params.binUrl, fileBuffer => {
    //if (parseInt(req.params.binSize, 10) !== fileBuffer.length) {
    //    websockets.notifyProgress(`Aborted DFU due to file-size mismatch after download...\nExpected: ${req.params.binSize} bytes\nActual: ${fileBuffer.length}bytes...\n`);
    //} else {
    websockets.notifyProgress(`Fetched ${fileBuffer.length} bytes...\n`);
    //}
    if (fileBuffer.error) {
      res.status(404).send(fileBuffer.error);
    } else {
      res.sendStatus(202);
      devices.flashDFU(fileBuffer, websockets.notifyProgress);
    }
  });
});

app.get("/imuf/:binUrl", (req, res) => {
  devices.list((err, ports) => {
    let connectedDevice = ports[0];
    if (connectedDevice) {
      fcConnector.updateIMUF(connectedDevice, req.params.binUrl);
      res.sendStatus(202);
    }
  });
});

app.get("/dfu", (req, res) => {
  devices.list((err, ports) => {
    let connectedDevice = ports[0];
    if (connectedDevice) {
      fcConnector.rebootDFU(
        connectedDevice,
        () => {
          res.sendStatus(202);
        },
        () => res.sendStatus(400)
      );
    }
  });
});

app.get("/telem/start", (req, res) => {
  devices.list((err, ports) => {
    let connectedDevice = ports[0];
    if (connectedDevice) {
      fcConnector.startTelemetry(
        connectedDevice,
        () => {
          res.sendStatus(202);
        },
        err => {
          res.status(400).send(err);
        }
      );
    }
  });
});
app.get("/telem/stop", (req, res) => {
  fcConnector.stopTelemetry();
  res.sendStatus(202);
});

app.listen(9001, () => console.log("usb interface listening on port 9001!"));

module.exports = {
  express,
  app
};

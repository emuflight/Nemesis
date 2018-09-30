const express = require("express");
const devices = require("./devices");
const fcConnector = require("./fcConnector");
const firmware = require("./firmware");
const app = express();
const websockets = require("./websockets");
const fileUpload = require("express-fileupload");

app.use(fileUpload());
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
    if (err) return res.status(400).send(err);
    let connectedDevice = ports[0];
    if (connectedDevice) {
      if (connectedDevice.dfu) {
        res.json(connectedDevice);
      } else {
        fcConnector
          .getConfig(connectedDevice)
          .then(deviceConfig => res.json(deviceConfig))
          .catch(error => res.status(426).send(error));
      }
    } else {
      res.sendStatus(404);
    }
  });
});
app.get("/profile/:type/:index", (req, res) => {
  devices.list((err, ports) => {
    if (err) return res.status(400).send(err);
    let connectedDevice = ports[0],
      type = req.params.type,
      index = req.params.index;
    if (connectedDevice) {
      fcConnector
        .setProfile(connectedDevice, type, index)
        .then(deviceConfig => res.json(deviceConfig))
        .catch(error => res.status(426).send(error));
    } else {
      res.sendStatus(404);
    }
  });
});

app.get("/send/:command", (req, res) => {
  devices.list((err, ports) => {
    if (err) return res.status(400).send(err);
    let connectedDevice = ports[0],
      command = req.params.command;

    if (connectedDevice) {
      fcConnector
        .sendCommand(connectedDevice, command)
        .then(output => res.status(200).send(output))
        .catch(error => res.status(400).send(error));
    } else {
      res.sendStatus(404);
    }
  });
});
app.get("/set/:name/:value", (req, res) => {
  devices.list((err, ports) => {
    if (err) return res.status(400).send(err);
    let connectedDevice = ports[0],
      name = req.params.name,
      value = req.params.value;
    if (connectedDevice) {
      fcConnector
        .setValue(connectedDevice, name, value)
        .then(ret => res.status(200).send(ret))
        .catch(error => res.status(400).send(error));
    } else {
      res.sendStatus(404);
    }
  });
});
app.get("/remap/:to/:from", (req, res) => {
  devices.list((err, ports) => {
    if (err) return res.status(400).send(err);
    let connectedDevice = ports[0],
      to = req.params.to,
      from = req.params.from;
    if (connectedDevice) {
      fcConnector
        .remapMotor(connectedDevice, to, from)
        .then(ret => res.status(200).send(ret))
        .catch(error => res.status(400).send(error));
    } else {
      res.sendStatus(404);
    }
  });
});
app.get("/spintest/:motor/:value", (req, res) => {
  devices.list((err, ports) => {
    if (err) return res.status(400).send(err);
    let connectedDevice = ports[0],
      motor = req.params.motor,
      value = req.params.value;
    if (connectedDevice) {
      fcConnector
        .spinTestMotor(connectedDevice, motor, value)
        .then(ret => res.status(200).send(ret))
        .catch(error => res.status(400).send(error));
    } else {
      res.sendStatus(404);
    }
  });
});
app.get("/save/eeprom", (req, res) => {
  devices.list((err, ports) => {
    if (err) return res.status(400).send(err);
    let connectedDevice = ports[0];
    if (connectedDevice) {
      fcConnector
        .saveEEPROM(connectedDevice)
        .then(res => {
          res.status(202).send(res);
        })
        .catch(err => {
          res.status(400).send(err);
        });
    } else {
      res.sendStatus(404);
    }
  });
});

app.post("/flash", (req, res) => {
  if (!req.files) {
    return res.sendStatus(400);
  }
  let fileObj = req.files.bin;
  let binBuffer = req.files.bin.data;
  let message = `Recieved ${binBuffer.length} bytes from ${fileObj.name}...\n`;
  if (fileObj.name.endsWith(".hex")) {
    let converted = firmware.convertToBin(binBuffer);
    binBuffer = converted.bin;
    message = `Converted ${fileObj.name} size: ${
      converted.hex.length
    } to .bin ...\n`;
  }
  console.log(message);
  websockets.notifyProgress(message);

  devices.flashDFU(binBuffer, websockets.notifyProgress);
  res.sendStatus(202);
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
      devices.flashDFU(fileBuffer, websockets.notifyProgress);
      res.sendStatus(202);
    }
  });
});

app.get("/imuf/:binUrl", (req, res) => {
  devices.list((err, ports) => {
    if (err) return res.status(400).send(err);
    let connectedDevice = ports[0];
    if (connectedDevice) {
      fcConnector.updateIMUF(connectedDevice, req.params.binUrl);
      res.sendStatus(202);
    }
  });
});

app.get("/dfu", (req, res) => {
  devices.list((err, ports) => {
    if (err) return res.status(400).send(err);
    let connectedDevice = ports[0];
    if (connectedDevice) {
      fcConnector
        .rebootDFU(connectedDevice)
        .then(() => res.sendStatus(202))
        .catch(() => res.sendStatus(400));
    }
  });
});

app.get("/telem/:type/start", (req, res) => {
  devices.list((err, ports) => {
    if (err) return res.status(400).send(err);
    let connectedDevice = ports[0];
    if (connectedDevice) {
      fcConnector.startTelemetry(connectedDevice, req.params.type);
      res.sendStatus(202);
    }
  });
});
app.get("/telem/stop", (req, res) => {
  fcConnector.stopTelemetry();
  res.sendStatus(202);
});

app.get("/assistant/:fw/:id", (req, res) => {
  let assistantData = require(`./config/assistant/${req.params.fw.toLowerCase()}/${req.params.id.toLowerCase()}.json`);
  res.json(assistantData);
});

app.get("/storage/:command", (req, res) => {
  devices.list((err, ports) => {
    if (err) return res.status(400).send(err);
    let connectedDevice = ports[0];
    if (connectedDevice) {
      fcConnector
        .storage(connectedDevice, req.params.command)
        .then(data => res.json(data))
        .catch(err => res.status(400).send(err));
    }
  });
});

app.listen(9001, () => console.log("usb interface listening on port 9001!"));

module.exports = {
  express,
  app
};

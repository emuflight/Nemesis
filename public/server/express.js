const express = require("express");
const devices = require("./devices");
const fcConnector = require("./fcConnector");
const firmware = require("./firmware");
const app = express();
const websockets = require("./websockets");
const fileUpload = require("express-fileupload");
const pjson = require("../../package.json");

const appVersion = pjson.version;

app.use(fileUpload());
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  res.header("Cache-Control", "private, no-cache, no-store, must-revalidate");
  res.header("Expires", "-1");
  res.header("Pragma", `no-cache, ${appVersion}`);
  next();
});

app.get("/device", (req, res) => {
  devices.get((err, connectedDevice) => {
    if (err) return res.status(400).send(err);
    if (connectedDevice) {
      if (connectedDevice.dfu) {
        res.json(connectedDevice);
      } else {
        fcConnector
          .getConfig(connectedDevice)
          .then(deviceConfig => res.json(deviceConfig))
          .catch(error => res.status(500).send(error));
      }
    } else {
      res.sendStatus(404);
    }
  });
});
app.get("/profile/:type/:index", (req, res) => {
  devices.get((err, connectedDevice) => {
    if (err) return res.status(400).send(err);
    let type = req.params.type,
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
  devices.get((err, connectedDevice) => {
    if (err) return res.status(400).send(err);
    let command = req.params.command;
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
  devices.get((err, connectedDevice) => {
    if (err) return res.status(400).send(err);
    let name = req.params.name,
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
app.get("/remap/:from/:to", (req, res) => {
  devices.get((err, connectedDevice) => {
    if (err) return res.status(400).send(err);
    let to = req.params.to,
      from = req.params.from;
    if (connectedDevice) {
      fcConnector
        .remapMotor(connectedDevice, from, to)
        .then(ret => res.status(200).send(ret))
        .catch(error => res.status(400).send(error));
    } else {
      res.sendStatus(404);
    }
  });
});
app.get("/spintest/:motor/:value", (req, res) => {
  devices.get((err, connectedDevice) => {
    if (err) return res.status(400).send(err);
    let motor = req.params.motor,
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
app.get("/modes", (req, res) => {
  devices.get((err, connectedDevice) => {
    if (err) return res.status(400).send(err);
    if (connectedDevice) {
      fcConnector
        .getModes(connectedDevice)
        .then(ret => res.status(200).send(ret))
        .catch(error => res.status(400).send(error));
    } else {
      res.sendStatus(404);
    }
  });
});
app.get("/modes/:modeVals", (req, res) => {
  devices.get((err, connectedDevice) => {
    if (err) return res.status(400).send(err);
    if (connectedDevice) {
      fcConnector
        .setMode(connectedDevice, req.params.modeVals)
        .then(ret => res.status(200).send(ret))
        .catch(error => res.status(400).send(error));
    } else {
      res.sendStatus(404);
    }
  });
});
app.get("/save/eeprom", (req, res) => {
  devices.get((err, connectedDevice) => {
    if (err) return res.status(400).send(err);
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
  let message = `Received ${binBuffer.length} bytes from ${fileObj.name}...\n`;
  if (fileObj.name.endsWith(".hex")) {
    let converted = firmware.convertToBin(binBuffer);
    binBuffer = converted.bin;
    message = `Converted ${fileObj.name} size: ${
      converted.hex.length
    } to .bin ...\n`;
  }
  console.log(message);
  websockets.notifyProgress(message);

  devices.flashDFU(
    binBuffer,
    websockets.notifyProgress,
    req.query.erase === "true"
  );
  res.sendStatus(202);
});

app.get("/flash/:binUrl", (req, res) => {
  let mesage = `Fetching binary from ${req.params.binUrl}...\n`;
  websockets.notifyProgress(mesage);
  firmware.load(req.params.binUrl, fileBuffer => {
    //if (parseInt(req.params.binSize, 10) !== fileBuffer.length) {
    //    websockets.notifyProgress(`Aborted DFU due to file-size mismatch after download...\nExpected: ${req.params.binSize} bytes\nActual: ${fileBuffer.length}bytes...\n`);
    //} else {
    let fetched = `Fetched ${fileBuffer.length} bytes...\n`;
    websockets.notifyProgress(fetched);
    //}
    if (fileBuffer.error) {
      res.status(404).send(fileBuffer.error);
    } else {
      devices.flashDFU(
        fileBuffer,
        websockets.notifyProgress,
        req.query.erase === "true"
      );
      res.sendStatus(202);
    }
  });
});

app.post("/imuf", (req, res) => {
  if (!req.files) {
    return res.sendStatus(400);
  }
  let fileObj = req.files.bin;
  let binBuffer = req.files.bin.data;
  let message = `Received ${binBuffer.length} bytes from ${fileObj.name}...\n`;
  if (fileObj.name.endsWith(".hex")) {
    let converted = firmware.convertToBin(binBuffer);
    binBuffer = converted.bin;
    message = `Converted ${fileObj.name} size: ${
      converted.hex.length
    } to .bin ...\n`;
  }
  console.log(message);
  websockets.notifyProgress(message);

  devices.get((err, connectedDevice) => {
    if (err) return res.status(400).send(err);

    if (connectedDevice) {
      fcConnector.updateIMUFLocal(connectedDevice, binBuffer);
      res.sendStatus(202);
    }
  });
});

app.get("/imuf/:binUrl", (req, res) => {
  devices.get((err, connectedDevice) => {
    if (err) return res.status(400).send(err);

    if (connectedDevice) {
      fcConnector.updateIMUF(connectedDevice, req.params.binUrl);
      res.sendStatus(202);
    }
  });
});

app.get("/tpa/:profile", (req, res) => {
  devices.get((err, connectedDevice) => {
    if (err || !connectedDevice) return res.status(400).send(err);
    fcConnector
      .getTpaCurves(connectedDevice, req.params.profile)
      .then(response => {
        res.status(200).send(response);
      });
  });
});

app.get("/tpa/:pid/:profile/:newCurve", (req, res) => {
  devices.get((err, connectedDevice) => {
    if (err || !connectedDevice) return res.status(400).send(err);
    fcConnector.setTpaCurves(
      connectedDevice,
      req.params.pid,
      req.params.profile,
      req.params.newCurve
    );
    res.sendStatus(200);
  });
});

app.get("/dfu", (req, res) => {
  devices.get((err, connectedDevice) => {
    if (err) return res.status(400).send(err);

    if (connectedDevice) {
      fcConnector
        .rebootDFU(connectedDevice)
        .then(() => res.sendStatus(202))
        .catch(() => res.sendStatus(400));
    }
  });
});

app.get("/telem/:type/start", (req, res) => {
  devices.get((err, connectedDevice) => {
    if (err) return res.status(400).send(err);

    if (connectedDevice) {
      fcConnector.startTelemetry(connectedDevice, req.params.type);
      res.sendStatus(202);
    }
  });
});
app.get("/telem/stop", (req, res) => {
  devices.get((err, connectedDevice) => {
    if (err) return res.status(400).send(err);

    if (connectedDevice) {
      fcConnector.stopTelemetry(connectedDevice);
      res.sendStatus(200);
    }
  });
});

app.get("/assistant/:fw/:id", (req, res) => {
  let assistantData = require(`./config/assistant/${req.params.fw.toLowerCase()}/${req.params.id.toLowerCase()}.json`);
  res.json(assistantData);
});

app.get("/storage/:command", (req, res) => {
  devices.get((err, connectedDevice) => {
    if (err) return res.status(400).send(err);

    if (connectedDevice) {
      fcConnector
        .storage(connectedDevice, req.params.command)
        .then(data => res.json(data))
        .catch(err => res.status(400).send(err));
    }
  });
});

app.get("/motors", (req, res) => {
  devices.get((err, connectedDevice) => {
    if (err) return res.status(400).send(err);

    if (connectedDevice) {
      fcConnector
        .getMotors(connectedDevice)
        .then(data => res.json(data))
        .catch(err => res.status(400).send(err));
    }
  });
});

app.get("/channelmap", (req, res) => {
  devices.get((err, connectedDevice) => {
    if (err) return res.status(400).send(err);

    if (connectedDevice) {
      fcConnector
        .getChannelMap(connectedDevice)
        .then(data => res.status(200).send(data))
        .catch(err => res.status(400).send(err));
    }
  });
});
app.get("/channelmap/:newmap", (req, res) => {
  devices.get((err, connectedDevice) => {
    if (err) return res.status(400).send(err);

    if (connectedDevice) {
      fcConnector
        .setChannelMap(connectedDevice, req.params.newmap)
        .then(data => res.json(data))
        .catch(err => res.status(400).send(err));
    }
  });
});

app.get("/font/:name", (req, res) => {
  devices.get((err, connectedDevice) => {
    if (err) return res.status(404).send(err);

    if (connectedDevice) {
      fcConnector
        .uploadFont(connectedDevice, req.params.name)
        .then(() => res.sendStatus(200))
        .catch(err => res.status(400).send(err));
    }
  });
});

app.listen(9001, () => console.info("usb interface listening on port 9001!"));

module.exports = {
  express,
  app
};

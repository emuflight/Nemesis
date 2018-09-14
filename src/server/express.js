const express = require("express");
const SerialPort = require("serialport");
const getfCConfig = require("./fcConfig");
const app = express();
require("./websockets");
const STM32USBInfo = require("./STM32USB.json");

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

app.get("/device", (req, res) => {
  SerialPort.list((err, ports) => {
    let connectedDevice = ports.filter(port => {
      return (
        port.vendorId === STM32USBInfo.vendorId &&
        port.productId === STM32USBInfo.productId
      );
    })[0];

    getfCConfig(
      connectedDevice.comName,
      config => {
        connectedDevice.config = config;
        res.json(connectedDevice);
      },
      res.err
    );
  });
});
app.listen(9001, () => console.log("usb interface listening on port 9001!"));

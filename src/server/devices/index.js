const SerialPort = require("serialport");
const HID = require("node-hid");
const STM32USBInfo = require("./STM32USB.json");

module.exports = {
  list: cb => {
    SerialPort.list((err, ports) => {
      const devices = HID.devices().filter(hid => {
        hid.hid = true;
        return (
          hid.vendorId === STM32USBInfo.hidVendorId &&
          hid.productId === STM32USBInfo.hidProductId
        );
      });
      cb(
        err,
        devices.concat(
          ports.filter(port => {
            return (
              port.vendorId === STM32USBInfo.vendorId &&
              port.productId === STM32USBInfo.productId
            );
          })
        )
      );
    });
  }
};

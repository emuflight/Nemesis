const SerialPort = require("serialport");
const usb = require("usb");
const HID = require("node-hid");
const STM32USBInfo = require("./STM32USB.json");

module.exports = {
  list: cb => {
    const devices = usb
      .getDeviceList()
      .filter(
        device =>
          device.deviceDescriptor.idVendor == STM32USBInfo.vendorId &&
          device.deviceDescriptor.idProduct == STM32USBInfo.dfuProductId
      )
      .map(device => {
        return Object.assign(
          {
            comName: "DFU",
            dfu: true,
            vendorId: device.deviceDescriptor.idVendor,
            productId: device.deviceDescriptor.idProduct
          },
          device.deviceDescriptor
        );
      });
    let hid = HID.devices().filter(port => {
      port.hid = true;
      return port.vendorId === STM32USBInfo.vendorId;
    });

    SerialPort.list((err, ports) => {
      const list =
        (devices.length && devices) ||
        (hid.length && hid) ||
        (ports.length &&
          ports.filter(port => port.vendorId === STM32USBInfo.octVendorId));
      cb(err, list);
    });
  },
  flashDFU(buffer) {
    let DFUDevice = usb
      .getDeviceList()
      .filter(
        device => device.deviceDescriptor.idVendor == STM32USBInfo.vendorId
      )[0];
    DFUDevice.open();
    DFUDevice.interface(0).claim();

    //TODO: flash dfu
    console.log(DFUDevice);
  }
};

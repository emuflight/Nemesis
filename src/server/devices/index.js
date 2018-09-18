const SerialPort = require("serialport");
const usb = require("usb");
const HID = require("node-hid");
const STM32USBInfo = require("./STM32USB.json");

let connectedDevice;

module.exports = {
  list: cb => {
    let devices = usb
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
    SerialPort.list((err, ports) => {
      const list = devices.concat(
        HID.devices().filter(port => port.vendorId === STM32USBInfo.vendorId),
        ports.filter(port => port.vendorId === STM32USBInfo.octVendorId)
      );
      cb(null, list);
    });
  },
  getConnectedDevice() {
    return connectedDevice;
  },
  setConnectedDevice(newConnectedDevice) {
    connectedDevice = newConnectedDevice;
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

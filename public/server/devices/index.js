const SerialPort = require("serialport");
const usb = require("usb");
const HID = require("node-hid");
const STM32USBInfo = require("./STM32USB.json");
const child_process = require("child_process");
const fs = require("fs");
const os = require("os");
const path = require("path");

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
  flashDFU: (fileBuffer, notify) => {
    let isProd = __dirname.indexOf("app.asar") > -1;
    let relative = isProd ? "../../../.." : "../../..";
    let dfuPath = `${relative}/public/server/utils/dfu/`;

    let filePath = `${path.join(__dirname, dfuPath, "temp.bin")}`;
    fs.writeFileSync(filePath, fileBuffer);
    var fileStats = fs.statSync(filePath);
    notify(`File size on disk:${fileStats.size}`);

    // let buffer = fs.readFileSync(filePath);
    let platform = os.platform();
    let executable = "dfu-util";
    if (platform === "win32") {
      executable += ".exe";
    }

    let command = `${path.join(
      __dirname,
      dfuPath,
      platform,
      os.arch(),
      executable
    )}`;

    let dfuProcess = child_process.spawn(command, [
      "-a",
      "0",
      "-s",
      "0x08000000:leave",
      "-D",
      filePath
    ]);
    dfuProcess.stdout.on("data", data => {
      output = data.toString("utf8");
      console.log(output);
      notify(output);
    });
    dfuProcess.stderr.on("data", data => {
      output = data.toString("utf8");
      console.log(output);
      notify(output);
    });
  }
};

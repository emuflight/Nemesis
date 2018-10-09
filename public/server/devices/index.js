const SerialPort = require("serialport");
const usb = require("usb");
const HID = require("node-hid");
const STM32USBInfo = require("./STM32USB.json");
const child_process = require("child_process");
const fs = require("fs");
const os = require("os");
const path = require("path");

module.exports = {
  get: cb => {
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
        (devices.length && devices[0]) ||
        (hid.length && hid[0]) ||
        (ports.length &&
          ports.find(
            port =>
              port.vendorId === STM32USBInfo.octVendorId &&
              port.productId === STM32USBInfo.octPoductId
          ));
      cb(err, list);
    });
  },
  flashDFU: (fileBuffer, notify, chipErase) => {
    let isProd = __dirname.indexOf("app.asar") > -1;
    let relative = isProd ? "../../../.." : "../../..";
    let dfuPath = `${relative}/public/server/utils/dfu/`;

    let filePath = `${path.join(__dirname, dfuPath, "temp.bin")}`;
    fs.writeFileSync(filePath, fileBuffer);
    var fileStats = fs.statSync(filePath);
    let fileSize = `File size on disk:${fileStats.size}`;
    notify(fileSize);

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
      "--device",
      ",0483:df11",
      "-a",
      "0",
      "-s",
      `0x08000000${chipErase ? ":mass-erase:force:" : ":"}leave`,
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
      // if (platform === "darwin") {
      //   output += `\n<h3>If you do not have libusb installed, please install it:</h3>
      //   <p><a href="http://dfu-util.sourceforge.net">here: or<a/></p>
      //   <p>'brew install libusb'</p>\n`;
      // }
      console.error(output);
      notify(output);
    });
  }
};

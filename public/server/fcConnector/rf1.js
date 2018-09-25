var HID = require("node-hid");

const strToBytes = string => {
  var bytes = new Array(64);
  var i;
  bytes[0] = 2;
  for (i = 1; i < 64; i++) {
    bytes[i] = string.charCodeAt(i - 1) || 0;
  }
  return bytes;
};

const getConfig = (device, cb, ecb) => {
  var device = new HID.HID(device.path);
  let sendBytes = strToBytes("config\n");
  let ret = "";
  const sendCB = () => {
    setTimeout(() => {
      device.close();
      try {
        ret = ret
          .slice(0, ret.indexOf("\n\0"))
          .replace(/\u0001|\u0000|\n/gim, "");
        // let data = ret.slice(0, ret.indexOf("}}") + 2);
        let data = JSON.parse(ret);
        data.version = "RACEFLIGHT|HELIO_SPRING|HESP|392";
        data.imuf = "108";
        cb(data);
      } catch (ex) {
        console.log(ex);
        cb({
          version: "RACEFLIGHT|HELIO_SPRING|HESP|392",
          error: ret,
          incompatible: true
        });
      }
    }, 1000);
  };
  device.on("data", function(data) {
    ret += data.toString("utf8");
    if (ret.indexOf("\0") === -1) {
      device.write(sendBytes);
    } else {
      sendCB();
    }
  });
  device.write(sendBytes);
};

const sendCommand = (device, command, cb, ecb, waitMs = 200) => {
  try {
    var device = new HID.HID(device.path);
    let ret = "";
    let timeout;
    device.on("data", data => {
      ret += data.toString("utf8");
      if (ret.indexOf("\n\0") === -1) {
        device.write(strToBytes("more\n"));
      }
      timeout && clearTimeout(timeout);
      timeout = setTimeout(() => {
        cb(ret.slice(0, ret.indexOf("\n\0")).replace(/\u0001|\u0000/gim, ""));
        device.close();
      }, waitMs);
    });
    device.on("error", error => {
      device.close();
      console.log("HID ERROR:", error);
      ecb & ecb(error);
    });
    device.write(strToBytes(`${command}\n`));
  } catch (ex) {
    device.close();
    console.log("HID EXCEPTON:", ex);
    ecb && ecb(ex);
  }
};

const updateIMUF = (comName, binName, notify, cb, ecb) => {
  ecb && ecb("not implemented");
};

const setValue = (comName, name, newVal, cb, ecb) => {
  sendCommand(comName, `set ${name}=${newVal}`, cb, ecb);
};

module.exports = {
  sendCommand: sendCommand,
  updateIMUF: updateIMUF,
  getConfig: getConfig,
  setValue: setValue
};

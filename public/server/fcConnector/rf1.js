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

const getConfig = device => {
  return sendCommand(device, "config\n").then(ret => {
    try {
      let data = JSON.parse(ret);
      data.version = "RACEFLIGHT|HELIO_SPRING|HESP|392";
      data.imuf = "108";
      return data;
    } catch (ex) {
      console.log(ex);
      return {
        version: "RACEFLIGHT|HELIO_SPRING|HESP|392",
        error: ret,
        incompatible: true
      };
    }
  });
};

// let connectedDevice;
const sendCommand = (device, command, waitMs = 200) => {
  return new Promise((resolve, reject) => {
    let connectedDevice = new HID.HID(device.path);
    let ret = "";
    let timeout;
    connectedDevice.on("data", data => {
      ret += data.toString("utf8");
      if (ret.indexOf("\n\0") === -1) {
        connectedDevice.write(strToBytes("more\n"));
      }
      timeout && clearTimeout(timeout);
      timeout = setTimeout(() => {
        connectedDevice.close();
        resolve(ret.slice(0, ret.indexOf("\n\0") + 1).replace(/\u0001/gim, ""));
      }, waitMs);
    });
    connectedDevice.on("error", error => {
      connectedDevice.close();
      console.log("HID ERROR:", error);
      resolve(error);
    });
    connectedDevice.write(strToBytes(`${command}\n`));
  });
};

const updateIMUF = (codeviceName, binName, notify, cb, ecb) => {
  ecb && ecb("not implemented");
};
const saveEEPROM = (codeviceName, binName, notify, cb, ecb) => {};

const setValue = (device, name, newVal) => {
  return sendCommand(device, `set ${name}=${newVal}`);
};

const getTelemetry = (device, cb, ecb) => {
  return sendCommand(device, "telem", 20).then(telemString => {
    let obj = {};
    telemString.split("\n#tm ").forEach(part => {
      let vals = part.split("=");
      obj[vals[0].replace("#tm ", "")] = parseFloat(vals[1]);
    });
    return {
      pitch: obj.pitch,
      roll: obj.roll,
      heading: obj.heading,
      acc: {
        x: obj.ax,
        y: obj.ay,
        z: obj.az
      },
      gyro: {
        x: obj.gx,
        y: obj.gy,
        z: obj.gz
      },
      q: {
        x: obj.qx,
        y: obj.qy,
        z: obj.qz,
        w: obj.qw
      }
    };
  });
};

module.exports = {
  sendCommand: sendCommand,
  updateIMUF: updateIMUF,
  getConfig: getConfig,
  getTelemetry: getTelemetry,
  setValue: setValue,
  saveEEPROM: saveEEPROM
};

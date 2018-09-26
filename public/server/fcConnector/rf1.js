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

// let connectedDevice;
const sendCommand = (device, command, cb, ecb, waitMs = 200) => {
  try {
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
        cb(ret.slice(0, ret.indexOf("\n\0")).replace(/\u0001|\u0000/gim, ""));
      }, waitMs);
    });
    connectedDevice.on("error", error => {
      connectedDevice.close();
      console.log("HID ERROR:", error);
      ecb & ecb(error);
    });
    connectedDevice.write(strToBytes(`${command}\n`));
  } catch (ex) {
    console.log("HID EXCEPTON:", ex);
    ecb && ecb(ex);
  }
};

const updateIMUF = (codeviceName, binName, notify, cb, ecb) => {
  ecb && ecb("not implemented");
};

const setValue = (device, name, newVal, cb, ecb) => {
  sendCommand(device, `set ${name}=${newVal}`, cb, ecb);
};

const getTelemetry = (device, cb, ecb) => {
  sendCommand(
    device,
    `telem`,
    telemString => {
      let obj = {};
      telemString.split("\n#tm ").forEach(part => {
        let vals = part.split("=");
        obj[vals[0].replace("#tm ", "")] = parseFloat(vals[1]);
      });
      cb({
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
      });
    },
    ecb,
    20
  );
};

module.exports = {
  sendCommand: sendCommand,
  updateIMUF: updateIMUF,
  getConfig: getConfig,
  getTelemetry: getTelemetry,
  setValue: setValue
};

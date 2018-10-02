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
      if (data) {
        ret += data.toString("utf8");
      }
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
  return sendCommand(device, `set ${name}=${newVal}`, 20);
};

const getMotors = device => {
  //???? TODO: find out what this is.
  return Promise.resolve([1, 1, 1, 1, 1, 0]);
  return sendCommand(device, `dump mixer`);
};

const remapMotor = (device, to, from) => {
  let motorTo = `set mout${from}=${parseInt(to) - 1}`;
  let motorFrom = `set mout${to}=${parseInt(from) - 1}`;
  return sendCommand(device, motorTo, 40).then(resp => {
    return sendCommand(device, motorFrom, 40).then(resp => {
      return resp;
    });
  });
};
const storage = (device, command) => {
  return sendCommand(device, "flashmsd");
};

const spinTestMotor = (device, motor, startStop) => {
  if (parseInt(startStop) < 1004) {
    return sendCommand(device, `idlestop`, 10);
  } else {
    return sendCommand(device, `Idle ${parseInt(motor) - 1}`, 10);
  }
};
const getChannelMap = device => {
  return sendCommand(device, `dump rccf`);
};
const setChannelMap = (device, newmap) => {
  let parts = newmap.split("");
  let allResponse = "";
  return setValue(
    device,
    "throttle_map",
    parseInt(parts[newmap.indexOf("T") + 4], 10) - 1
  ).then(t => {
    allResponse += t;
    return setValue(
      device,
      "roll_map",
      parseInt(parts[newmap.indexOf("A") + 4], 10) - 1
    ).then(a => {
      allResponse += a;
      return setValue(
        device,
        "pitch_map",
        parseInt(parts[newmap.indexOf("E") + 4], 10) - 1
      ).then(e => {
        allResponse += e;
        return setValue(
          device,
          "yaw_map",
          parseInt(parts[newmap.indexOf("R") + 4], 10) - 1
        ).then(r => {
          allResponse += r;
          return allResponse;
        });
      });
    });
  });
};

const getTelemetry = (device, type) => {
  switch (type) {
    case "rx":
      return sendCommand(device, "rcrxdata", 20).then(telemString => {
        let channels = [];

        telemString.split("\n#rb ").forEach(part => {
          let pairs = part.split("=");
          let vals = pairs[1].split(":");
          channels[parseInt(pairs[0].replace("#rb ", "")) - 1] = parseInt(
            vals[0],
            10
          );
        });
        return {
          type: type,
          channels
        };
      });
      break;
    default:
    case "gyro":
      return sendCommand(device, "telem", 20).then(telemString => {
        let obj = {};
        telemString.split("\n#tm ").forEach(part => {
          let vals = part.split("=");
          obj[vals[0].replace("#tm ", "")] = parseFloat(vals[1]);
        });
        return {
          type: type,
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
  }
};

module.exports = {
  sendCommand: sendCommand,
  updateIMUF: updateIMUF,
  getConfig: getConfig,
  getTelemetry: getTelemetry,
  setValue: setValue,
  remapMotor: remapMotor,
  spinTestMotor: spinTestMotor,
  storage: storage,
  getMotors: getMotors,
  getChannelMap: getChannelMap,
  setChannelMap: setChannelMap,
  saveEEPROM: saveEEPROM
};

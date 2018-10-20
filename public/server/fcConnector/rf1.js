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
      data.version = "RACEFLIGHT|HELIOSPRING|HESP|392";
      data.imuf = "108";
      return data;
    } catch (ex) {
      console.log(ex);
      return {
        version: "RACEFLIGHT|HELIOSPRING|HESP|392",
        error: ret,
        incompatible: true
      };
    }
  });
};

const commandQueue = [];
let currentCommand;
let connectedDevice;

const runQueue = next => {
  if (!next) return;
  currentCommand = next;
  if (!connectedDevice) {
    connectedDevice = new HID.HID(next.device.path);
  }
  let ret = "";
  const process = command => {
    connectedDevice.write(strToBytes(command));
    connectedDevice.read((err, data) => {
      if (data) {
        ret += data.toString("utf8");
      }
      if (ret.indexOf("\n\0") === -1) {
        process("more\n");
      } else {
        ret =
          ret &&
          ret.slice(0, ret.indexOf("\n\0") + 1).replace(/\u0001|\.000/gim, "");
        next.resolve(ret);
        currentCommand = null;
        runQueue(commandQueue.pop());
      }
    });
  };
  process(`${next.command}\n`);
};
const sendCommand = (device, command) => {
  return new Promise((resolve, reject) => {
    commandQueue.unshift({ device, command, resolve, reject });
    if (!currentCommand) {
      runQueue(commandQueue.pop());
    }
  });
};

const updateIMUF = (codeviceName, binName, notify, cb, ecb) => {
  ecb && ecb("not implemented");
};
const saveEEPROM = (codeviceName, binName, notify, cb, ecb) => {};

const setValue = (device, name, newVal) => {
  return sendCommand(device, `set ${name}=${newVal}`);
};

const getMotors = device => {
  //???? TODO: find out what this is.
  return Promise.resolve([1, 1, 1, 1, 0]);
};

const setMode = (device, modeVals) => {
  valParts = modeVals.split("|");
  return sendCommand(
    device,
    `modes ${valParts[1]}=${parseInt(valParts[2]) + 5}=${valParts[3]}=${
      valParts[4]
    }`
  );
};

const getModes = device => {
  return sendCommand(device, "modes list").then(response => {
    let split = response.split("\nmodes ");
    split.shift();
    let modes = split.map((mode, i) => {
      let parts = mode.split("=");
      let modeName = parts[0],
        channel = parseInt(parts[1]),
        start = parseInt(parts[2]),
        end = parseInt(parts[3]);
      if (channel + start + end === 0) {
        channel = -1;
      }
      if (channel > 4) {
        channel = channel - 5;
      }
      return {
        id: i,
        auxId: i,
        mode: modeName,
        channel: channel,
        range: [start, end]
      };
    });
    return modes;
  });
};

const remapMotor = (device, from, to) => {
  let commandFrom = `set mout${from}=${parseInt(to) - 1}`;
  let commandto = `set mout${to}=${parseInt(from) - 1}`;
  return sendCommand(device, commandFrom).then(resp => {
    return sendCommand(device, commandto).then(resp => {
      return resp;
    });
  });
};
const storage = (device, command) => {
  switch (command) {
    case "erase":
      return sendCommand(device, "eraseallflash");
    case "info":
      return sendCommand(device, "dlflstatusdump").then(storageInfo => {
        let data = storageInfo.split("#fl ");
        data.shift();
        let vals = data.map(v => {
          return parseInt(v.split("=")[1]);
        });
        return {
          ready: true,
          supported: true,
          sectors: 0,
          totalSize: vals[1],
          usedSize: vals[0]
        };
      });
    case "download":
    default:
      return sendCommand(device, "flashmsd");
  }
};

const spinTestMotor = (device, motor, startStop) => {
  if (parseInt(startStop) < 1004) {
    return sendCommand(device, `idlestop`);
  } else {
    return sendCommand(device, `Idle ${parseInt(motor) - 1}`);
  }
};

const getTpaCurves = (device, profile) => {
  let profileInt = parseInt(profile) + 1;
  return sendCommand(device, `dump`).then(resp => {
    let params = resp
      .split("\n")
      .filter(line => line.startsWith(`tpa`))
      .reduce((reducer, line) => {
        let parts = line.split(" ");
        if (parts[0].endsWith(profileInt)) {
          reducer[parts[0].slice(3, 5)] = parts[1].split("=");
        }
        return reducer;
      }, {});
    return params;
  });
};
const setTpaCurves = (device, pid, profile, newCurve) => {
  let command = `tpa${pid}${parseInt(profile, 10) + 1} ${newCurve}`;
  console.log(command);
  return sendCommand(device, command);
};
const getChannelMap = device => {
  return sendCommand(device, `dump rccf`).then(response => {
    let params = response.split("set ").reduce((reducer, line) => {
      let parts = line.split("=");
      reducer[parts[0]] = parts[1] && parts[1].replace("\n", "");
      return reducer;
    }, {});
    let channels = [
      parseInt(params.throttle_map, 10) + 1,
      parseInt(params.roll_map, 10) + 1,
      parseInt(params.pitch_map, 10) + 1,
      parseInt(params.yaw_map, 10) + 1
    ];
    let map = {};
    map[channels[0]] = "T";
    map[channels[1]] = "A";
    map[channels[2]] = "E";
    map[channels[3]] = "R";
    return `${map[1]}${map[2]}${map[3]}${map[4]}1234`;
  });
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
    default:
    case "rx":
      return sendCommand(device, "rcrxdata").then(telemString => {
        let channels = [];
        if (telemString) {
          telemString.split("\n#rb ").forEach(part => {
            let pairs = part.split("=");
            let vals = pairs[1] && pairs[1].split(":");
            channels[parseInt(pairs[0].replace("#rb ", "")) - 1] = parseInt(
              vals && vals[0],
              10
            );
          });
        }
        return {
          rx: {
            min: 0,
            max: 2000,
            channels
          }
        };
      });
    case "vbat": {
      return sendCommand(device, `polladc`).then(vbatData => {
        let params = vbatData
          .replace("#me ", "")
          .split(", ")
          .reduce((reducer, line) => {
            let parts = line.split(": ");
            reducer[parts[0]] = parts[1] && parts[1].replace("\n", "");
            return reducer;
          }, {});
        let volts = parseInt(params.Voltage, 10) * 0.01;
        // let data = new DataView(new Uint8Array(vbatData).buffer, 11);
        let cells = Math.max(volts / 3.7, volts / 4.2);
        return {
          type: "vbat",
          cells: cells,
          cap: 0,
          volts: volts.toFixed(2),
          mah: parseInt(params.mAh, 10),
          amps: parseInt(params.Current, 10)
        };
      });
    }
    case "attitude":
    case "gyro":
      return sendCommand(device, "telem").then(telemString => {
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
          attitude: {
            x: obj.qx,
            y: obj.qy,
            z: obj.qz,
            w: obj.qw
          }
        };
      });
  }
};

const reset = () => {
  if (connectedDevice) {
    connectedDevice.close();
  }
  connectedDevice = undefined;
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
  getModes: getModes,
  setMode: setMode,
  getTpaCurves: getTpaCurves,
  setTpaCurves: setTpaCurves,
  saveEEPROM: saveEEPROM,
  reset: reset
};

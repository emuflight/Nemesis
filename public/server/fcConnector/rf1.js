const HID = require("node-hid");
const imufFirmware = require("../firmware/imuf");

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
  if (!connectedDevice) {
    connectedDevice = new HID.HID(device.path);
  }
  return sendCommand(device, "config\n").then(config => {
    return sendCommand(device, "version\n").then(version => {
      try {
        let data = JSON.parse(config);
        console.log("got data");
        let versionInfo = version
          .replace(/#vr\s|#fc\s/gim, "")
          .split(/;|\n/)
          .filter(part => part)
          .reduce((reducer, part) => {
            if (part) {
              let params = part.split(":");
              let name = params[0] && params[0].replace(/\s|\n/gim, "");
              let value = params[1] && params[1].replace(/^\s|\s$/, "");
              if (name) {
                reducer[name] = value;
              }
            }
            return reducer;
          }, {});
        console.log("version data", versionInfo);
        let hardware = versionInfo.HARDWARE || "HELIOSPRING";
        data.version = `RACEFLIGHT|${hardware}|RFLT|${versionInfo.VERSION}`;
        data.imuf = versionInfo.IMUFVERSION || "108";
        return data;
      } catch (ex) {
        console.log(ex);
        return {
          version: "RACEFLIGHT|HELIOSPRING|RFLT|0.0.0",
          imuf: "0000",
          error: ret,
          incompatible: true
        };
      }
    });
  });
};

const commandQueue = [];
let currentCommand;
let connectedDevice;

const runQueue = next => {
  if (!next) return;
  currentCommand = next;
  let ret = "";
  const process = command => {
    try {
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
            ret.slice(0, ret.indexOf("\n\0") + 1).replace(/\u0001/gim, "");
          next.resolve(ret);
          currentCommand = null;
          runQueue(commandQueue.pop());
        }
      });
    } catch (ex) {
      next.reject(ret);
      currentCommand = null;
      runQueue(commandQueue.pop());
    }
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

const updateIMUF = (device, binName, notify) => {
  notify(`Downloading ${binName}...\n`);
  imufFirmware.load(binName, fileBuffer => {
    notify("Communicating with IMU-F...\n");
    let binAsStr = fileBuffer.toString("hex");
    // let binAsStr = fs.readFileSync(path.join(__dirname, './IMUF_1.1.0_STARBUCK_ALPHA.bin')).toString('hex');
    sendCommand(device, "imufbootloader").then(bootlresp => {
      console.log(bootlresp);
      if (bootlresp.indexOf("BOOTLOADER") > -1) {
        notify("IMU-F ready to talk...\n");
        sendCommand(device, "imufloadbin e\n").then(prepResp => {
          console.log(prepResp);
          if (prepResp.indexOf("SUCCESS") > -1) {
            notify(`Loading binary onto IMU-F...\n`);
            let index = 0;
            const sendBytes = () => {
              if (index < binAsStr.length) {
                let tail = Math.min(binAsStr.length, index + 38);
                //sending 20 bytes at a time, not sure why we get "CRAP" back when 14 is the hex of 20.
                let sending = `imufloadbin l13000000${binAsStr.slice(
                  index,
                  tail
                )}\n`;
                console.log(sending);
                sendCommand(device, sending).then(res => {
                  console.log(res);
                  notify(".");
                  index = tail;
                  sendBytes();
                });
              } else {
                notify("\nFlashing IMU-F...\n");
                sendCommand(device, "imufflashbin\n").then(r => {
                  console.log(r);
                  notify(r);
                  notify("\ndone!\nPlease wait for reboot..\n \n#flashEmu");
                });
              }
            };
            sendBytes();
          }
        });
      }
    });
  });
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
  let commandTo = `set mout${to}=${parseInt(from) - 1}`;
  let commandFrom = `set mout${from}=${parseInt(to) - 1}`;
  return sendCommand(device, commandTo).then(resp1 => {
    return sendCommand(device, commandFrom).then(resp2 => {
      return resp1 + resp2;
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
      return sendCommand(device, "msd");
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
    let map = [];
    map[parseInt(params.throttle_map, 10)] = "T";
    map[parseInt(params.roll_map, 10)] = "A";
    map[parseInt(params.pitch_map, 10)] = "E";
    map[parseInt(params.yaw_map, 10)] = "R";
    return `${map[0]}${map[1]}${map[2]}${map[3]}1234`;
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
    case "status": {
      return sendCommand(device, "telem").then(telemString => {
        let obj = {};
        telemString
          .replace("\n#nomore\n")
          .split("\n#tm ")
          .forEach(part => {
            let vals = part.split(/=|:/gim);
            obj[vals[0].replace("#tm ", "")] = vals[1];
          });
        return {
          type: type,
          cpu: Math.ceil(parseFloat(obj.cpu) * 100),
          loop: parseFloat(obj.loop),
          khz: parseInt(obj.hz, 10) * 0.001,
          debug: [obj.DEBUGF, obj.DEBUGI, obj.DEBUGU]
        };
      });
    }
    default:
    case "rx":
      return sendCommand(device, "rcrxdata").then(telemString => {
        let channels = [];
        if (telemString) {
          telemString.split("\n#rb ").forEach(part => {
            let pairs = part.split("=");
            let vals = pairs[1] && pairs[1].split(":");
            channels[parseInt(pairs[0].replace("#rb ", "")) - 1] = parseInt(
              vals && vals[1],
              10
            );
          });
        }
        return {
          rx: {
            min: -1000,
            max: 1000,
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

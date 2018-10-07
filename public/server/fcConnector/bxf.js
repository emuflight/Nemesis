const SerialPort = require("serialport");
const imufFirmware = require("../firmware/imuf");
let openConnection;

const setupConnection = device => {
  return new Promise((resolve, reject) => {
    const connect = () => {
      if (!openConnection.isOpen) {
        console.log("Trying to open port: ", device.comName);
        try {
          openConnection.open(openError => {
            if (openError) {
              console.log("OPEN ERROR: ", openError);
              reject(openError);
            } else {
              openConnection.write("!\n", cliError => {
                if (cliError) {
                  console.log("couldn't get into cli mode: ", cliError);
                  reject(cliError);
                } else {
                  setTimeout(() => {
                    openConnection.read();
                    resolve(openConnection);
                  }, 200);
                }
              });
            }
          });
        } catch (ex) {
          reject(error);
        }
      }
    };
    if (!openConnection) {
      console.log("creating new port port: ", device.comName);
      openConnection = new SerialPort(device.comName, {
        baudRate: 115200,
        autoOpen: false
      });
      openConnection.on("error", err => {
        console.log("ERROR: ", err);
        openConnection = undefined;
        reject(err);
      });
      // openConnection.setEncoding('utf8');
      setTimeout(() => connect(), 200);
    } else if (!openConnection.isOpen) {
      console.log("port is not open! ", device.comName);
      connect();
    } else {
      console.log("using open port: ", device.comName);
      resolve(openConnection);
    }
  });
};

const getConfig = device => {
  return sendCommand(device, "config").then(conf => {
    try {
      //trim off " config\n";
      return JSON.parse(conf.slice(conf.indexOf("{"), conf.length - 3));
    } catch (ex) {
      console.log(ex);
      return sendCommand(device, "version").then(version => {
        return { version: version, incompatible: true };
      });
    }
  });
};

const commandQueue = [];
let currentCommand;
const runQueue = next => {
  if (!next) return;
  currentCommand = next;
  setupConnection(next.device)
    .then(port => {
      console.log(
        `sending command: ${next.command} on port ${next.device.comName}`
      );
      port.write(`${next.command}\n`, err => {
        if (err) {
          console.log("WRITE ERROR: ", err);
          err && next.reject(err);
          currentCommand = null;
          runQueue(commandQueue.pop());
        }
      });
      let currentRecBuffer = "";
      let interval = setInterval(() => {
        let more = port.read();
        if (more) {
          if (next.encode) {
            let msg = more.toString(next.encode);
            currentRecBuffer += msg;
          } else {
            currentRecBuffer = more;
          }
        } else {
          interval && clearInterval(interval);
          next.resolve(currentRecBuffer);
          currentCommand = null;
          runQueue(commandQueue.pop());
        }
      }, next.waitMs);
    })
    .catch(error => {
      console.log(error);
    });
};

const sendCommand = (device, command, waitMs = 200, encode = "utf8") => {
  return new Promise((resolve, reject) => {
    commandQueue.unshift({ device, command, waitMs, encode, resolve, reject });
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
    sendCommand(device, "imufbootloader", 5000).then(bootlresp => {
      if (bootlresp.indexOf("BOOTLOADER") > -1) {
        notify("IMU-F ready to talk...\n");
        sendCommand(device, "imufloadbin !").then(prepResp => {
          if (prepResp.indexOf("SUCCESS") > -1) {
            notify(`Loading binary onto IMU-F...\n`);
            let index = 0;
            const sendBytes = () => {
              if (index < binAsStr.length) {
                let tail = Math.min(binAsStr.length, index + 200);
                let sending = `imufloadbin l64000000${binAsStr.slice(
                  index,
                  tail
                )}\n`;
                sendCommand(device, sending, 50).then(() => {
                  notify(".");
                  index = tail;
                  sendBytes();
                });
              } else {
                notify("\nFlashing IMU-F...\n");
                sendCommand(device, "imufflashbin\n", 5000).then(() => {
                  notify("\ndone!\nPlease wait for reboot..\n \n#flyhelio");
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

const setValue = (device, name, newVal) => {
  return sendCommand(device, `set ${name}=${newVal}`);
};

const remapMotor = (device, from, to) => {
  return sendCommand(device, `resource`, 40).then(resources => {
    let mapping = resources
      .split("\nresource ")
      .filter(line => line.indexOf("MOTOR") > -1)
      .map(motorResource => {
        let resourceParts = motorResource.split(" ");
        return resourceParts[2];
      });
    console.log(mapping);
    let resourceTo = mapping[parseInt(to) - 1];
    let resourceFrom = mapping[parseInt(from) - 1];
    return sendCommand(device, `resource MOTOR ${from} ${resourceTo}`, 20).then(
      () => {
        return sendCommand(device, `resource MOTOR ${to} ${resourceFrom}`, 20);
      }
    );
  });
};
const spinTestMotor = (device, motor, startStop) => {
  return sendCommand(
    device,
    `motor ${parseInt(motor, 10) - 1} ${startStop}`,
    10
  );
};

const getTpaCurves = deviceInfo => {
  return sendCommand(deviceInfo, "tpacurve");
};
const setTpaCurves = (deviceInfo, pid, profile, newCurve) => {
  return sendCommand(deviceInfo, `tpacurve ${pid} ${newCurve}`);
};

const saveEEPROM = device => {
  return sendCommand(device, `msp 250`);
};
const getChannelMap = device => {
  return sendCommand(device, `map`, 30).then(mapping => {
    return mapping.replace(/map|\s+|#|\n/gim, "");
  });
};
const setChannelMap = (device, newmap) => {
  return sendCommand(device, `map ${newmap}`);
};
const getModes = device => {
  // return sendCommand(device, `map`);
};
const setMode = (device, modeVals) => {
  return sendCommand(device, `aux ${modeVals.split("|").join(" ")}`, 20);
};

const getMotors = device => {
  return sendCommand(device, "msp 104", 50, false).then(motorData => {
    let data = new DataView(new Uint8Array(motorData).buffer, 12);

    let motorInfo = [];
    try {
      for (var i = 0; i < 10; i++) {
        motorInfo.push(data.getUint16(i * 2, 1));
      }
    } catch (ex) {
      console.log(ex);
    }
    return motorInfo;
  });
};

const storage = (device, command) => {
  switch (command) {
    case "erase":
      return sendCommand(device, "msp 72");
    case "info":
      //MSP_DATAFLASH_SUMMARY
      return sendCommand(device, "msp 70", 50, false).then(storageInfo => {
        let data = new DataView(new Uint8Array(storageInfo).buffer, 12);
        var flags = data.getUint8(0);
        return {
          ready: (flags & 1) != 0,
          supported: (flags & 2) != 0,
          sectors: data.getUint32(1, 1),
          totalSize: data.getUint32(5, 1),
          usedSize: data.getUint32(9, 1)
        };
      });
    case "download":
    default:
      return sendCommand(device, "msc");
  }
};

let lastTelem;
const getTelemetry = (device, type) => {
  switch (type) {
    case "status": {
      return sendCommand(device, `msp 150`, 50, false).then(telem => {
        if (telem) {
          try {
            let data = new DataView(new Uint8Array(telem).buffer, 12);
            let modeFlasCount = data.getUint8(15);
            let modeflags = [];
            let offset = 16;
            for (var i = 0; i < modeFlasCount; i++) {
              modeflags.push(data.getUint8(offset++));
            }
            lastTelem = {
              type: "status",
              cpu: data.getUint16(11, 1),
              modeflags: modeflags,
              flagCount: data.getUint8(offset++),
              armingFlags: data.getUint32(offset, 1)
            };
          } catch (ex) {
            console.log(ex);
          }
        }
        return lastTelem;
      });
    }
    case "gyro": {
      return sendCommand(device, `msp 102`, 50, false).then(telem => {
        if (telem) {
          try {
            let data = new DataView(new Uint8Array(telem).buffer, 12);
            lastTelem = {
              type: "gyro",
              acc: {
                x: data.getInt16(0, 1) / 512,
                y: data.getInt16(2, 1) / 512,
                z: data.getInt16(4, 1) / 512
              },
              gyro: {
                x: data.getInt16(6, 1) * (4 / 16.4),
                y: data.getInt16(8, 1) * (4 / 16.4),
                z: data.getInt16(10, 1) * (4 / 16.4)
              },
              mag: {
                x: data.getInt16(12, 1) / 1090,
                y: data.getInt16(14, 1) / 1090,
                z: data.getInt16(16, 1) / 1090
              }
            };
          } catch (ex) {
            console.log(ex);
          }
        }
        return lastTelem;
      });
    }
    case "vbat": {
      return sendCommand(device, `msp 130`, 50, false).then(vbatData => {
        let data = new DataView(new Uint8Array(vbatData).buffer, 12);
        console.log(data);
        return {
          type: "vbat",
          cells: data.getUint8(0),
          cap: data.getUint16(1, 1),
          volts: data.getUint8(3) / 10.0,
          mah: data.getUint16(4, 1),
          amps: data.getUint16(6, 1) / 100
        };
      });
    }
    default:
    case "rx": {
      return sendCommand(device, `msp 105`, 50, false).then(rcData => {
        let channels = [];
        try {
          let data = new DataView(new Uint8Array(rcData).buffer, 12);
          let active = (data.byteLength - 4) / 2;
          for (var i = 0; i < active; i++) {
            channels[i] = data.getUint16(i * 2, 1);
          }
        } catch (ex) {
          console.log(ex);
          return lastTelem;
        }
        lastTelem = {
          type: "rx",
          min: 800,
          max: 2200,
          channels
        };
        return lastTelem;
      });
    }
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
  getModes: getModes,
  setMode: setMode,
  getTpaCurves: getTpaCurves,
  setTpaCurves: setTpaCurves,
  saveEEPROM: saveEEPROM
};

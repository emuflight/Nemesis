const SerialPort = require("serialport");
const imufFirmware = require("../firmware/imuf");
const os = require("os");

const getConfig = device => {
  return sendCommand(device, "!").then(() => {
    return sendCommand(device, "config", 2200).then(conf => {
      try {
        //trim off " config\n";
        return JSON.parse(conf.slice(7, conf.length - 2));
      } catch (ex) {
        console.log(ex);
        return sendCommand(device, "version").then(version => {
          return { version: version, incompatible: true };
        });
      }
    });
  });
};

const sendCommand = (device, command, waitMs = 200) => {
  return new Promise((resolve, reject) => {
    let port = new SerialPort(device.comName, {
      baudRate: 115200,
      autoOpen: false
    });
    let ret = "";
    let timeout;
    port.on("error", err => {
      console.log("ERROR: ", err);
      reject(err);
    });
    port.on("data", data => {
      ret += data;
      timeout && clearTimeout(timeout);
      timeout = setTimeout(() => {
        port.isOpen && port.close();
        resolve(ret);
        ret = "";
      }, waitMs);
    });
    const openSerial = () => {
      port.open(openError => {
        if (openError) {
          console.log("OPEN ERROR: ", openError);
          reject(openError);
        } else {
          port.write(`${command}\n`, err => {
            if (err) {
              console.log("WRITE ERROR: ", err);
              err && reject(err);
            }
          });
        }
      });
    };
    setTimeout(() => openSerial(), 100);
  });
};

const updateIMUF = (device, binName, notify) => {
  notify(`Downloading ${binName}...\n`);
  imufFirmware.load(binName, fileBuffer => {
    let binAsStr = fileBuffer.toString("hex");
    // let binAsStr = fs.readFileSync(path.join(__dirname, './IMUF_1.1.0_STARBUCK_ALPHA.bin')).toString('hex');
    let port = new SerialPort(device.comName, {
      baudRate: 115200,
      autoOpen: false
    });
    let ret = "";
    port.on("error", err => {
      ecb && ecb(err);
    });
    port.on("data", data => {
      ret = data.toString("utf8");
    });
    port.open(openError => {
      if (!openError) {
        port.write("imufbootloader\n", err => {
          if (!err) {
            setTimeout(() => {
              if (ret.indexOf("BOOTLOADER") > -1) {
                notify("Communicating with IMU-F...\n");
                port.write("imufloadbin !\n");
                setTimeout(() => {
                  if (ret.indexOf("SUCCESS") > -1) {
                    notify(`Loading binary onto IMU-F...\n`);
                    let index = 0;
                    let interval = setInterval(() => {
                      if (index < binAsStr.length) {
                        let tail = Math.min(binAsStr.length, index + 200);
                        let sending = `imufloadbin l64000000${binAsStr.slice(
                          index,
                          tail
                        )}\n`;
                        port.write(sending);
                        notify(".");
                        index = tail;
                      } else {
                        notify("\nFlashing IMU-F...\n");
                        clearInterval(interval);
                        port.write("imufflashbin\n");
                        setTimeout(() => {
                          port.close();
                          notify("\ndone!\n#flyhelio");
                        }, 10000);
                      }
                    }, 50);
                  }
                }, 5000);
              }
            }, 5000);
          }
        });
      }
    });
  });
};

const setValue = (device, name, newVal) => {
  return sendCommand(device, `set ${name}=${newVal}`);
};

const saveEEPROM = device => {
  return sendCommand(device, `msp 250`);
};

const getTelemetry = device => {
  return sendCommand(device, `msp 102`, 50).then(buffer => {
    try {
      let data = new DataView(new Uint8Array(buffer).buffer, 12);
      return {
        telemetry: true,
        acc: {
          x: data.getInt16(2, 1) / 512,
          y: data.getInt16(4, 1) / 512,
          z: data.getInt16(6, 1) / 512
        },
        gyro: {
          x: data.getInt16(8, 1) * (4 / 16.4),
          y: data.getInt16(10, 1) * (4 / 16.4),
          z: data.getInt16(12, 1) * (4 / 16.4)
        },
        mag: {
          x: data.getInt16(14, 1) / 1090,
          y: data.getInt16(16, 1) / 1090,
          z: data.getInt16(18, 1) / 1090
        }
      };
    } catch (ex) {
      console.log(ex);
      return Proimise.reject(ex);
    }
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

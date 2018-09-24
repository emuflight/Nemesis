const SerialPort = require("serialport");
const imufFirmware = require("../firmware/imuf");

let openPort;
const ensurePort = (device, cb, ecb) => {
  openPort = new SerialPort(device.comName, {
    autoOpen: false
  });
  setTimeout(() => {
    try {
      openPort.open(cb);
    } catch (ex) {
      ecb(ex);
      console.log("error attempting to open", ex);
    }
  }, 100);
};

const getVersion = (device, cb, ecb) => {
  sendCommand(
    device,
    "version",
    data => {
      cb(data);
    },
    ecb,
    500
  );
};
const getConfig = (device, cb, ecb) => {
  sendCommand(
    device,
    "!",
    () => {
      setTimeout(() => {
        sendCommand(
          device,
          "config",
          conf => {
            try {
              //trim off " config\n";
              conf = JSON.parse(conf.slice(7, conf.length - 2));
            } catch (ex) {
              return getVersion(device, cb);
            }
            cb(conf);
          },
          ecb,
          2200
        );
      }, 100);
    },
    ecb
  );
};

const sendCommand = (device, command, cb, ecb, waitMs = 200) => {
  try {
    let ret = "";
    let timeout;
    ensurePort(
      device,
      () => {
        openPort.on("data", data => {
          ret += data;
          timeout && clearTimeout(timeout);
          timeout = setTimeout(() => {
            cb(ret);
            openPort.isOpen && openPort.close();
            ret = "";
          }, waitMs);
        });
        openPort.write(`${command}\n`, err => {
          err && ecb && ecb(err);
        });
      },
      ecb
    );
  } catch (ex) {
    console.log(ex);
    ecb && ecb(ex);
  }
};

const updateIMUF = (device, binName, notify) => {
  notify(`Downloading ${binName}...\n`);
  imufFirmware.load(binName, fileBuffer => {
    let binAsStr = fileBuffer.toString("hex");
    // let binAsStr = fs.readFileSync(path.join(__dirname, './IMUF_1.1.0_STARBUCK_ALPHA.bin')).toString('hex');
    ensurePort(
      device,
      () => {
        let ret = "";
        openPort.on("data", data => {
          ret = data.toString("utf8");
        });
        openPort.write("imufbootloader\n");
        setTimeout(() => {
          if (ret.indexOf("BOOTLOADER") > -1) {
            notify("Communicating with IMU-F...\n");
            openPort.write("imufloadbin !\n");
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
                    openPort.write(sending);
                    notify(".");
                    index = tail;
                  } else {
                    notify("\nFlashing IMU-F...\n");
                    clearInterval(interval);
                    openPort.write("imufflashbin\n");
                    setTimeout(() => {
                      notify("\ndone!\n#flyhelio");
                      openPort.isOpen && openPort.close();
                    }, 10000);
                  }
                }, 50);
              }
            }, 5000);
          }
        }, 5000);
      },
      ecb
    );
  });
};

const setValue = (device, name, newVal, cb, ecb) => {
  sendCommand(device, `set ${name}=${newVal}`, cb, ecb);
};

const getTelemetry = (device, cb, ecb) => {
  sendCommand(
    device,
    `msp 102`,
    buffer => {
      try {
        let data = new DataView(new Uint8Array(buffer).buffer, 12);
        cb({
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
        });
      } catch (ex) {
        ecb && ecb(ex);
      }
    },
    error => {
      console.log("telemetry error:", error);
      ecb(error);
    }
  );
};

module.exports = {
  sendCommand: sendCommand,
  updateIMUF: updateIMUF,
  getConfig: getConfig,
  getTelemetry: getTelemetry,
  setValue: setValue
};

/**
 * const SerialPort = require("serialport");
const Delimiter = SerialPort.parsers.Delimiter;
let port;

const getConfig = (comName, cb, ecb) => {
  try {
    const parser = new Delimiter({
      delimiter: "#END",
      encoding: 'utf8'
    });
    port =
      port ||
      new SerialPort(comName, {
        baudRate: 115200
      });
    port.pipe(parser);
    port.on("close", () => {
      port = undefined;
      console.log("port closed");
    });
    parser.on("data", data => {

      let ret = data.replace(/#/g, '').replace("config", "");
      if (ret.length > 10) {
        cb(ret);
      }
    });
    port.write("#\n", err => {
      setTimeout(() => {
        port.write("config\n", err => {
          if (err){
            ecb(err);
          }
        });
      }, 1000);
    });

  } catch (ex) {
    console.log(ex);
    ecb && ecb(ex);
  }
};

const setValue = (comName, name, newVal, cb, ecb) => {
  try {
    port =
      port ||
      new SerialPort(comName, {
        baudRate: 115200
      });
    port.write(`set ${name}=${newVal}\n`, err => {
      setTimeout(() => {
        cb();
      }, 1000);
    });
  } catch (ex) {
    console.log(ex);
    ecb && ecb(ex);
  }
};
const saveConfig = (comName, cb, ecb) => {
  try {
    port.write(`save\n`, err => {
      setTimeout(() => {
        cb();
      }, 1000);
    });
  } catch (ex) {
    console.log(ex);
    ecb && ecb(ex);
  }
};

module.exports = {
  getConfig: getConfig,
  setValue: setValue,
  saveConfig: saveConfig
};

 */

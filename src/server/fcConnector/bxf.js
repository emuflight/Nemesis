const SerialPort = require("serialport");
const Readline = SerialPort.parsers.Readline;
const imufFirmware = require("../firmware/imuf");

const getConfig = (comName, cb, ecb) => {
  try {
    const parser = new Readline({
      delimiter: "#"
    });
    let port = new SerialPort(comName, {
      baudRate: 115200
    });
    port.pipe(parser);
    let ret = "";
    let sendNext = false;
    parser.on("data", data => {
      if (sendNext) {
        ret = data;
        sendNext = false;
      }
    });
    port.write("!\n", err => {
      setTimeout(() => {
        port.write("config\n", err => {
          sendNext = true;
          setTimeout(() => {
            //trim off " config\n";
            cb(JSON.parse(ret.slice(7)));
            port && port.close();
            //1000ms is about how long it takes to read the json data reliably
          }, 1200);
        });
        //200ms is ~as fast as we can go reliably
      }, 200);
    });
  } catch (ex) {
    console.log(ex);
    ecb && ecb(ex);
  }
};

const sendCommand = (comName, command, cb, ecb) => {
  try {
    let port = new SerialPort(comName, {
      baudRate: 115200
    });
    let ret = "";
    let timeout;
    port.on("data", data => {
      ret += data;
      timeout && clearTimeout(timeout);
      timeout = setTimeout(() => {
        cb(ret);
        port && port.close();
      }, 200);
    });
    port.write(`${command}\n`, err => {
      err && ecb && ecb(err);
    });
  } catch (ex) {
    console.log(ex);
    ecb && ecb(ex);
  }
};

const updateIMUF = (comName, binName, notify, cb, ecb) => {
  try {
    imufFirmware.load(binName, fileBuffer => {
      console.log(fileBuffer);

      cb("done");
      return;
      sendCommand(comName, "imufbootloader\n", () => {
        sendCommand(comName, "imufloadbin !\n", () => {
          //repeat this line:
          sendCommand(comName, "imufloadbin l\n", () => {
            notify("progress");
            // on the last one:
            sendCommand(comName, "imufloadbin .\n", () => {
              sendCommand(comName, "imufloadbin c\n", () => {
                //notify when done
                cb("done");
              });
            });
          });
        });
      });
    });
  } catch (ex) {
    console.log(ex);
    ecb && ecb(ex);
  }
};

const setValue = (comName, name, newVal, cb, ecb) => {
  sendCommand(comName, `set ${name}=${newVal}`, cb, ecb);
};

const getTelemetry = (comName, cb, ecb) => {
  sendCommand(
    comName,
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

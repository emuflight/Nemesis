const SerialPort = require("serialport");
const Readline = SerialPort.parsers.Readline;
let port;

const getConfig = (comName, cb, ecb) => {
  try {
    const parser = new Readline({
      delimiter: "#"
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
    let ret = "";
    let sendNext = false;
    parser.on("data", data => {
      if (sendNext) {
        ret = data;
        sendNext = false;
      }
    });
    port.write("#\n", err => {
      setTimeout(() => {
        port.write("config\n", err => {
          sendNext = true;
          setTimeout(() => {
            //trim off " config\n";
            cb(JSON.parse(ret.slice(7)));
          }, 1000);
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
    port =
      port ||
      new SerialPort(comName, {
        baudRate: 115200
      });
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

const closeConnection = () => {
  port && port.close();
};

module.exports = {
  getConfig: getConfig,
  setValue: setValue,
  saveConfig: saveConfig,
  close: closeConnection
};

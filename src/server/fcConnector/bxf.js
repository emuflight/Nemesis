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

const sendCommand = (comName, command, cb, ecb) => {
  try {
    port =
      port ||
      new SerialPort(comName, {
        baudRate: 115200
      });
    port.write(`${command}\n`, err => {
      setTimeout(() => {
        cb();
      }, 1000);
    });
  } catch (ex) {
    console.log(ex);
    ecb && ecb(ex);
  }
};

const setValue = (comName, name, newVal, cb, ecb) => {
  sendCommand(comName, `set ${name}=${newVal}`, cb, ecb);
};

const closeConnection = () => {
  port && port.close();
};

module.exports = {
  getConfig: getConfig,
  setValue: setValue,
  sendCommand: sendCommand,
  close: closeConnection
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

const closeConnection = () => {
  port && port.close();
};

module.exports = {
  getConfig: getConfig,
  setValue: setValue,
  saveConfig: saveConfig,
  close: closeConnection
};

 */

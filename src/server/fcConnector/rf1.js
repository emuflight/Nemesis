var HID = require("node-hid");
var dummyConfig = require("../../test/test_rf1_config.json");

const strToBytes = string => {
  var bytes = new Array(64);
  var i;
  bytes[0] = 2;
  for (i = 1; i < 64; i++) {
    bytes[i] = string.charCodeAt(i - 1) || 0;
  }
  return bytes;
};

const getConfig = (path, cb, ecb) => {
  var device = new HID.HID(path);
  let sendBytes = strToBytes("config\n");
  let ret = "";
  const sendCB = () => {
    setTimeout(() => {
      device.close();
      ret = ret.replace(/\u0001|\u0000|\n/gim, "");
      ret = ret.slice(0, ret.indexOf("}}") + 2);
      ret = JSON.parse(ret);
      ret.version = "RACEFLIGHT|HELIO_SPRING|HESP|392";
      ret.imuf = "108";
      cb(ret);
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

const sendCommand = (path, command, cb, ecb) => {
  try {
    var device = new HID.HID(path);
    let sendBytes = strToBytes(`${command}\n`);
    device.on("data", data => {
      device.close();
      console.log("HID DATA:", data);
      cb(data);
    });
    device.on("error", error => {
      device.close();
      console.log("HID ERROR:", error);
      ecb(error);
    });
    device.write(sendBytes);
  } catch (ex) {
    device.close();
    console.log("HID EXCEPTON:", ex);
    ecb && ecb(ex);
  }
};

const updateIMUF = (comName, binName, notify, cb, ecb) => {
  cb();
};

const setValue = (comName, name, newVal, cb, ecb) => {
  sendCommand(comName, `set ${name}=${newVal}`, cb, ecb);
};

const closeConnection = () => {
  port && port.close();
};

module.exports = {
  sendCommand: sendCommand,
  close: closeConnection,
  updateIMUF: updateIMUF,
  getConfig: getConfig,
  setValue: setValue
};

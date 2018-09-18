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
  let doneReading = false;
  let ret = "";

  while (!doneReading) {
    device.write(sendBytes);
    device.read((error, data) => {
      if (error) {
        ecb(error);
      }
      let next = data.toString("utf8");
      console.log(next);
      ret += next;
      doneReading = ret.indexOf("\0") !== -1;
      if (doneReading) {
        cb(ret);
        return;
      }
    });
  }
};

module.exports = {
  getConfig: getConfig
};

var HID = require("node-hid");
var dummyConfig = require("../../test/test_config.json");

const getConfig = (path, cb, ecb) => {
  var device = new HID.HID(path);
  cb(dummyConfig);
  device.on("data", data => {
    console.log(data);
  });
  device.write("dump");
};

module.exports = {
  getConfig: getConfig
};

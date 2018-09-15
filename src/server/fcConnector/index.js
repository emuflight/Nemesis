const bxfConnector = require("./bxf");
const rf1Connector = require("./rf1");

module.exports = {
  getConfig(deviceInfo, cb, ecb) {
    if (deviceInfo.hid) {
      return rf1Connector.getConfig(deviceInfo.path, cb, ecb);
    } else {
      return bxfConnector.getConfig(deviceInfo.comName, cb, ecb);
    }
  },
  setValue(deviceInfo, key, value, cb, ecb) {
    if (deviceInfo.hid) {
      return rf1Connector.setValue(deviceInfo.path, key, value, cb, ecb);
    } else {
      return bxfConnector.setValue(deviceInfo.comName, key, value, cb, ecb);
    }
  },
  saveConfig(deviceInfo, cb, ecb) {
    if (deviceInfo.hid) {
      return rf1Connector.saveConfig(deviceInfo.path, cb, ecb);
    } else {
      return bxfConnector.saveConfig(deviceInfo.comName, cb, ecb);
    }
  }
};

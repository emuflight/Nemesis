const bxfConnector = require("./bxf");
const rf1Connector = require("./rf1");

module.exports = {
  getConfig(deviceInfo, cb, ecb) {
    if (deviceInfo.hid) {
      return rf1Connector.getConfig(deviceInfo.path, cb, ecb);
    } else {
      return bxfConnector.getConfig(deviceInfo.comName, cb, ecb);
    }
  }
};

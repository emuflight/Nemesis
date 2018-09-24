const bxfConnector = require("./bxf");
const rf1Connector = require("./rf1");
const websockets = require("../websockets");
const utils = require("../utils/utils.js");
const BxfUiConfig = require("../config/ui_config_bef.json");

const skipprops = [
  "pid_profile",
  "rate_profile",
  "modes",
  "features",
  "ports",
  "tpa_curves"
];
const formatConfig = (conf, uiConf) => {
  Object.keys(conf).forEach(key => {
    if (skipprops.indexOf(key) > -1) return;
    //check the keymap for old values and set them to the new one.
    if (uiConf.keymap[key]) {
      conf[uiConf.keymap[key]] = conf[key];
      key = uiConf.keymap[key];
    }
    if (uiConf.elements[key]) {
      conf[key] = Object.assign({}, conf[key], uiConf.elements[key]);
    } else if (conf[key].values) {
      conf[key].values = conf[key].values.map(k => {
        return {
          label: k,
          value: k
        };
      });
    }
    conf[key].id = key;
    uiConf.routes.forEach(r => {
      if (!conf[key].route && uiConf.groups[r].indexOf(key) > -1) {
        conf[key].route = r;
      }
    });
  });
};
const applyUIConfig = (device, config, uiConfig) => {
  formatConfig(config, uiConfig);

  config.pidProfileList = config.pid_profile.values.map((v, k) => {
    formatConfig(v, uiConfig);
    return {
      label: `Profile ${k + 1}`,
      value: k
    };
  });
  config.rateProfileList = config.rate_profile.values.map((v, k) => {
    formatConfig(v, uiConfig);
    return {
      label: `Profile ${k + 1}`,
      value: k
    };
  });
  config.modes.values = config.modes.values.map((mode, i) => {
    let parts = mode.split("|");

    let id = i,
      auxId = parseInt(parts[0], 10) || i,
      auxMode = parseInt(parts[1], 10),
      channel = parseInt(parts[2], 10),
      start = parseInt(parts[3], 10),
      end = parseInt(parts[4], 10);
    channel =
      auxMode === 0 && channel === 0 && start === 900 && end === 900
        ? -1
        : channel;
    auxMode =
      auxMode === 0 &&
      (channel === 0 || channel === -1) &&
      start === 900 &&
      end === 900
        ? -1
        : auxMode;
    return {
      id: id,
      auxId: auxId,
      mode: auxMode,
      channel: channel,
      range: [start, end]
    };
  });
  config.features.values = config.features.values.map(feature => {
    let current = true,
      key = feature;
    if (feature.startsWith("-")) {
      current = false;
      key = key.slice(1);
    }
    return {
      id: key,
      current: current
    };
  });

  config.ports.values = config.ports.values.map(port => {
    let parts = port.split("|");
    return {
      id: parts[0],
      mode: parts[1],
      mspBaud: parts[2],
      gpsBaud: parts[3],
      telemBaud: parts[4],
      bblBaud: parts[5]
    };
  });
  config.currentPidProfile = parseInt(config.pid_profile.current, 10);
  config.currentRateProfile = parseInt(config.rate_profile.current, 10);
  config.routes = uiConfig.routes.map(route => {
    return {
      key: route,
      title: route
    };
  });

  config.startingRoute = config.routes[0];
  device.config = config;

  return device;
};

module.exports = {
  getConfig(deviceInfo, cb, ecb) {
    if (deviceInfo.hid) {
      return rf1Connector.getConfig(deviceInfo.path, cb, ecb);
    } else {
      return bxfConnector.getConfig(
        deviceInfo,
        config => {
          cb(applyUIConfig(deviceInfo, config, BxfUiConfig));
        },
        ecb
      );
    }
  },
  setValue(deviceInfo, key, value, cb, ecb) {
    if (deviceInfo.hid) {
      return rf1Connector.setValue(deviceInfo.path, key, value, cb, ecb);
    } else {
      return bxfConnector.setValue(deviceInfo, key, value, cb, ecb);
    }
  },
  sendCommand(deviceInfo, command, cb, ecb) {
    if (deviceInfo.hid) {
      return rf1Connector.sendCommand(deviceInfo.path, command, cb, ecb);
    } else {
      return bxfConnector.sendCommand(deviceInfo, command, cb, ecb);
    }
  },
  getTelemetry(deviceInfo, cb, ecb) {
    if (deviceInfo.hid) {
      return rf1Connector.getTelemetry(deviceInfo.path, cb, ecb);
    } else {
      return bxfConnector.getTelemetry(deviceInfo, cb, ecb);
    }
  },
  updateIMUF(deviceInfo, binUrl, cb, ecb) {
    if (deviceInfo.hid) {
      return rf1Connector.updateIMUF(
        deviceInfo.path,
        binUrl,
        data => {
          websockets.clients.forEach(client =>
            client.sendUTF(
              JSON.stringify({
                progress: data
              })
            )
          );
        },
        cb,
        ecb
      );
    } else {
      return bxfConnector.updateIMUF(
        deviceInfo,
        binUrl,
        data => {
          websockets.clients.forEach(client =>
            client.sendUTF(
              JSON.stringify({
                progress: data
              })
            )
          );
        },
        cb,
        ecb
      );
    }
  }
};

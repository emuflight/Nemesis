//const emuConnector = require("./emu");
const bxfConnector = require("./bxf");
//const rf1Connector = require("./rf1");
const websockets = require("../websockets");
const BxfUiConfig = require("../config/ui_config_bef.json");
//const rf1UiConfig = require("../config/ui_config_rf1.json");
const request = require("request").defaults({ encoding: "utf8" });

const skipprops = [
  "pid_profile",
  "rate_profile",
  "modes",
  "features",
  "ports",
  "tpa_curves"
];

//TODO: do this dynamically;
const assistants = ["RX", "VTX", "MOTORS", "GYRO"];
const createMockObj = (id, val) => {
  return {
    id: id,
    current: 0,
    mode: "LOOKUP",
    values: [
      { label: id + 0, value: 0 },
      { label: id + 1, value: 1 },
      { label: id + 2, value: 2 }
    ]
  };
};

const formatConfig = (conf, uiConf) => {
  Object.keys(conf).forEach(key => {
    if (skipprops.indexOf(key) > -1) return;
    if (conf[key].mode === "BITMASK") {
      conf[key].values = ["OFF", "ON"];
    }
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
    conf[key].mode = conf[key].mode || "DIRECT";
    uiConf.routes.forEach(r => {
      if (!conf[key].route && uiConf.groups[r].indexOf(key) > -1) {
        conf[key].route = r;
      }
    });
  });
};
const applyUIConfig = (device, config, uiConfig) => {
  formatConfig(config, uiConfig);

  if (!config.isBxF) {
    config.rate_profile = createMockObj("rate_profile");
    config.pid_profile = createMockObj("pid_profile");
    const globalKeys = ["bit_reverse_esc_", "mout"];
    Object.keys(config).forEach(key => {
      if (globalKeys.indexOf(key.slice(0, key.length - 1)) > -1) {
        return;
      } else if (key.endsWith("1")) {
        config.pid_profile.values[0][key] = config[key];
        config.rate_profile.values[0][key] = config[key];
        delete config[key];
      } else if (key.endsWith("2")) {
        config.pid_profile.values[1][key] = config[key];
        config.rate_profile.values[1][key] = config[key];
        delete config[key];
      } else if (key.endsWith("3")) {
        config.pid_profile.values[2][key] = config[key];
        config.rate_profile.values[2][key] = config[key];
        delete config[key];
      }
    });
  }
  config.pidProfileList = config.pid_profile.values.map((v, k) => {
    formatConfig(v, uiConfig);
    return {
      label: `Profile ${k + 1}`,
      value: k
    };
  });
  config.currentPidProfile = parseInt(config.pid_profile.current, 10);
  config.rateProfileList = config.rate_profile.values.map((v, k) => {
    formatConfig(v, uiConfig);
    return {
      label: `Profile ${k + 1}`,
      value: k
    };
  });
  config.currentRateProfile = parseInt(config.rate_profile.current, 10);
  if (config.modes) {
    let hasArmMode = false;
    config.modes.values = config.modes.values.map((mode, i) => {
      let parts = mode.split("|");

      let id = i,
        auxId = parseInt(parts[0], 10) || i,
        auxMode = parseInt(parts[1], 10),
        channel = parseInt(parts[2], 10),
        start = parseInt(parts[3], 10),
        end = parseInt(parts[4], 10);

      if (!hasArmMode && auxMode === 0) {
        auxMode = 0;
        hasArmMode = true;
      } else if (auxMode === 0) {
        auxMode = -1;
      }
      return {
        id: id,
        auxId: auxId,
        mode: auxMode,
        channel: channel,
        range: [start, end]
      };
    });
  }
  if (config.ports) {
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
  }
  if (config.features) {
    config.features.values = config.features.values.map(feature => {
      let current = true,
        key = feature;
      if (feature.startsWith("-")) {
        current = false;
        key = key.slice(1);
      }
      return {
        id: key,
        current: current,
        hasPort: uiConfig.featurePorts.indexOf(key) > -1
      };
    });
  }
  if (config.pitch_map) {
    let mapping = {};
    mapping[config.throttle_map.current] = "T";
    mapping[config.roll_map.current] = "A";
    mapping[config.pitch_map.current] = "E";
    mapping[config.yaw_map.current] = "R";
    config.channel_map = `${mapping["0"]}${mapping["1"]}${mapping["2"]}${
      mapping["3"]
    }1234`;
  }
  config.motor_order = uiConfig.motor_order;
  config.reboot_on_save = uiConfig.reboot_on_save;
  config.routes = uiConfig.routes.map(route => {
    return {
      key: route,
      title: route,
      assistant: assistants.indexOf(route) > -1
    };
  });
  config.routeFeatures = uiConfig.routeFeatures;
  config.aux_channel_modes = uiConfig.aux_channel_modes;
  config.rx_scale = uiConfig.rx_scale;
  let versionParts = config.version.split("|");
  config.version = {
    fw: versionParts[0],
    target: versionParts[1],
    version: versionParts[3],
    imuf: config.imuf
  };
  config.startingRoute = config.routes[0];
  device.config = config;

  return device;
};

module.exports = new class FcConnector {
  getConfig(deviceInfo) {
    return bxfConnector.getConfig(deviceInfo).then(config => {
      if (config.incompatible) {
        return Object.assign({ error: config.version }, deviceInfo, config);
      } else {
        config.isBxF = true;
        return applyUIConfig(deviceInfo, config, BxfUiConfig);
      }
    });
  }
  setValue(deviceInfo, key, value) {
    if (deviceInfo.hid) {
      return rf1Connector.setValue(deviceInfo, key, value);
    } else {
      return bxfConnector.setValue(deviceInfo, key, value);
    }
  }
  setProfile(deviceInfo, type, index) {
    if (deviceInfo.hid) {
      return Promise.resolve();
      // return rf1Connector.setValue(deviceInfo, key, value);
    } else {
      let profileName = type === "pid" ? "profile" : "rateprofile";
      return bxfConnector.sendCommand(deviceInfo, `${profileName} ${index}`);
    }
  }
  remapMotor(deviceInfo, from, to) {
    return bxfConnector.remapMotor(deviceInfo, from, to);
  }

  getMotors(deviceInfo) {
    return bxfConnector.getMotors(deviceInfo);
  }

  getModes(deviceInfo) {
    return bxfConnector.getModes(deviceInfo);
  }
  setMode(deviceInfo, modeVals) {
    return bxfConnector.setMode(deviceInfo, modeVals);
  }

  getChannelMap(deviceInfo) {
    return bxfConnector.getChannelMap(deviceInfo);
  }

  setChannelMap(deviceInfo, newMap) {
    return bxfConnector.setChannelMap(deviceInfo, newMap);
  }
  spinTestMotor(deviceInfo, motor, startStop) {
    return bxfConnector.spinTestMotor(deviceInfo, motor, startStop);
  }
  getTpaCurves(deviceInfo, profile) {
    return bxfConnector.getTpaCurves(deviceInfo, profile);
  }
  setTpaCurves(deviceInfo, pid, profile, newCurve) {
    return bxfConnector.setTpaCurves(deviceInfo, pid, profile, newCurve);
  }
  sendCommand(deviceInfo, command) {
    return bxfConnector.sendCommand(deviceInfo, command);
  }
  uploadFont(deviceInfo, name = "butterflight") {
    return new Promise((resolve, reject) => {
      if (deviceInfo.hid) return resolve("not supported");
      request(
        {
          url: `https://raw.githubusercontent.com/ButterFlight/butterflight-configurator/master/resources/osd/${name}.mcm`,
          headers: {
            "User-Agent": "request"
          }
        },
        (error, response, body) => {
          if (response.statusCode >= 400) {
            reject({ error: body });
          } else {
            resolve();
            let sentPackets = 0;
            let data = body.split("\n");
            data.shift();
            for (let i = 0; i < 256; i++) {
              let index = i * 64;
              let chunk = data
                .slice(index, index + 54)
                .map(byte => parseInt(byte, 2));
              chunk.unshift(i);
              let hexStr = Buffer.from(chunk).toString("hex");
              bxfConnector
                .sendCommand(deviceInfo, `msp 87 ${hexStr}`, 40)
                .then(resp => {
                  sentPackets++;
                  websockets.notifyProgress(resp);
                  if (sentPackets === 255) {
                    bxfConnector.sendCommand(deviceInfo, `save`);
                  }
                });
            }
          }
        }
      );
    });
  }
  startTelemetry(deviceInfo, type, fastIntervalMs = 100) {
    clearInterval(websockets.wsServer.fastTelemetryInterval);
    clearInterval(websockets.wsServer.slowTelemetryInterval);
    websockets.wsServer.telemetryType = type;
    if (type !== "status") {
      websockets.wsServer.fastTelemetryInterval = setInterval(() => {
        bxfConnector.getTelemetry(deviceInfo, type).then(telemData => {
          websockets.notifyTelem(telemData);
        });
      }, type === "rx" ? 250 : fastIntervalMs);
    }
    websockets.wsServer.slowTelemetryInterval = setInterval(() => {
      bxfConnector.getTelemetry(deviceInfo, "status").then(telemData => {
        websockets.notifyTelem(telemData);
      });
    }, 500);
  }
  stopTelemetry(deviceInfo) {
    clearInterval(websockets.wsServer.fastTelemetryInterval);
  }
  rebootDFU(deviceInfo) {
    return bxfConnector.sendCommand(deviceInfo, "bl");
  }
  storage(deviceInfo, command) {
    return bxfConnector.storage(deviceInfo, command);
  }
  saveEEPROM(deviceInfo) {
    return bxfConnector.saveEEPROM(deviceInfo);
  }
  updateIMUF(deviceInfo, binUrl, cb, ecb) {
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
}();

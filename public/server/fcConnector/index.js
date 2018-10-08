const bxfConnector = require("./bxf");
const rf1Connector = require("./rf1");
const websockets = require("../websockets");
const BxfUiConfig = require("../config/ui_config_bef.json");
const rf1UiConfig = require("../config/ui_config_rf1.json");
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
        current: current
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
    if (deviceInfo.hid) {
      return rf1Connector.getConfig(deviceInfo).then(config => {
        return applyUIConfig(deviceInfo, config, rf1UiConfig);
      });
    } else {
      return bxfConnector.getConfig(deviceInfo).then(config => {
        if (config.incompatible) {
          return Object.assign({ error: config.version }, deviceInfo, config);
        } else {
          config.isBxF = true;
          this.startTelemetry(deviceInfo, "status", 1000);
          return applyUIConfig(deviceInfo, config, BxfUiConfig);
        }
      });
    }
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
    if (deviceInfo.hid) {
      return rf1Connector.remapMotor(deviceInfo, from, to);
    } else {
      return bxfConnector.remapMotor(deviceInfo, from, to);
    }
  }

  getMotors(deviceInfo) {
    if (deviceInfo.hid) {
      return rf1Connector.getMotors(deviceInfo);
    } else {
      return bxfConnector.getMotors(deviceInfo);
    }
  }

  getModes(deviceInfo) {
    if (deviceInfo.hid) {
      return rf1Connector.getModes(deviceInfo);
    } else {
      return bxfConnector.getModes(deviceInfo);
    }
  }
  setMode(deviceInfo, modeVals) {
    if (deviceInfo.hid) {
      return rf1Connector.setMode(deviceInfo, modeVals);
    } else {
      return bxfConnector.setMode(deviceInfo, modeVals);
    }
  }

  getChannelMap(deviceInfo) {
    if (deviceInfo.hid) {
      return rf1Connector.getChannelMap(deviceInfo);
    } else {
      return bxfConnector.getChannelMap(deviceInfo);
    }
  }

  setChannelMap(deviceInfo, newMap) {
    if (deviceInfo.hid) {
      return rf1Connector.setChannelMap(deviceInfo, newMap);
    } else {
      return bxfConnector.setChannelMap(deviceInfo, newMap);
    }
  }
  spinTestMotor(deviceInfo, motor, startStop) {
    if (deviceInfo.hid) {
      return rf1Connector.spinTestMotor(deviceInfo, motor, startStop);
    } else {
      return bxfConnector.spinTestMotor(deviceInfo, motor, startStop);
    }
  }
  getTpaCurves(deviceInfo, profile) {
    if (deviceInfo.hid) {
      return rf1Connector.getTpaCurves(deviceInfo, profile);
    } else {
      return bxfConnector.getTpaCurves(deviceInfo, profile);
    }
  }
  setTpaCurves(deviceInfo, pid, profile, newCurve) {
    if (deviceInfo.hid) {
      return rf1Connector.setTpaCurves(deviceInfo, pid, profile, newCurve);
    } else {
      return bxfConnector.setTpaCurves(deviceInfo, pid, profile, newCurve);
    }
  }
  sendCommand(deviceInfo, command) {
    if (deviceInfo.hid) {
      return rf1Connector.sendCommand(deviceInfo, command);
    } else {
      return bxfConnector.sendCommand(deviceInfo, command);
    }
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
  startTelemetry(deviceInfo, type, intervalMs = 150) {
    clearInterval(websockets.wsServer.telemetryInterval);
    websockets.wsServer.telemetryType = type;
    websockets.wsServer.telemetryInterval = setInterval(() => {
      if (deviceInfo.hid) {
        rf1Connector.getTelemetry(deviceInfo, type).then(telemData => {
          websockets.notifyTelem(telemData);
        });
      } else {
        bxfConnector.getTelemetry(deviceInfo, type).then(telemData => {
          websockets.notifyTelem(telemData);
        });
      }
    }, intervalMs);
  }
  stopTelemetry(deviceInfo) {
    clearInterval(websockets.wsServer.telemetryInterval);
    if (websockets.wsServer.telemetryType !== "status") {
      this.startTelemetry(deviceInfo, "status", 2000);
    }
  }
  rebootDFU(deviceInfo) {
    if (deviceInfo.hid) {
      return rf1Connector.sendCommand(deviceInfo, "rebootDFU");
    } else {
      return bxfConnector.sendCommand(deviceInfo, "bl");
    }
  }
  storage(deviceInfo, command) {
    if (deviceInfo.hid) {
      return rf1Connector.storage(deviceInfo, command);
    } else {
      return bxfConnector.storage(deviceInfo, command);
    }
  }
  saveEEPROM(deviceInfo) {
    if (deviceInfo.hid) {
      return rf1Connector.saveEEPROM(deviceInfo);
    } else {
      return bxfConnector.saveEEPROM(deviceInfo);
    }
  }
  updateIMUF(deviceInfo, binUrl, cb, ecb) {
    if (deviceInfo.hid) {
      return rf1Connector.updateIMUF(
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
}();

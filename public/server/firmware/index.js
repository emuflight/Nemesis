const request = require("request").defaults({ encoding: null });
var intelhex = require("@connectedyard/node-intelhex");

module.exports = new class {
  get(cb) {
    request(
      {
        url: "https://api.github.com/repos/heliorc/imuf_dev_repo/contents",
        headers: {
          "User-Agent": "request"
        }
      },
      (error, response, body) => {
        cb(
          JSON.parse(body)
            .filter(
              file =>
                file.name.endsWith(".hex") && !file.name.startsWith("IMUF")
            )
            .map(file => {
              file.note =
                "Release notes: https://github.com/ButterFlight/butterflight/releases/";
              return file;
            })
        );
      }
    );
  }
  load(name, callback) {
    request(
      {
        url: name,
        headers: {
          "User-Agent": "request"
        }
      },
      (error, response, body) => {
        if (response.statusCode >= 400) {
          callback({ error: body });
        } else {
          if (name.indexOf(".hex") > -1) {
            this.verifyBin(body, callback);
          } else {
            callback(body);
          }
        }
      }
    );
  }
  convertToBin(data) {
    let hexData = data.toString("utf8");
    let binData = intelhex.intelHexToBinary(hexData, {
      startAtOffsetZero: true
    });
    return {
      hex: hexData,
      bin: binData
    };
  }
}();

const request = require("request");
const devices = require("../devices");

module.exports = new class {
  get(cb) {
    request(
      {
        url: "https://api.github.com/repos/heliorc/imuf-release/contents",
        headers: {
          "User-Agent": "request"
        }
      },
      (error, response, body) => {
        cb(
          JSON.parse(body)
            .filter(file => file.name.endsWith(".hex"))
            .map(file => {
              file.name = file.name.replace("_MSD_1.0.0_IMUF", " IMU-F");
              file.note =
                "Release notes: https://github.com/ButterFlight/butterflight/releases/";
              return file;
            })
        );
      }
    );
  }

  flash(name) {
    request(
      {
        url: name,
        headers: {
          "User-Agent": "request"
        }
      },
      (error, response, body) => {
        let resJson = JSON.parse(body);
        let fileBuffer = new Buffer(resJson.content, resJson.encoding);
        devices.flashDFU(fileBuffer);
      }
    );
  }
}();

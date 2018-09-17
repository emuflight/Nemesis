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
                "See the release notes here: https://github.com/heliorc/imuf-release/blob/master/CHANGELOG.md";
              return file;
            })
        );
      }
    );
  }

  flash(name) {
    console.log(name);
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

// import { UsbSerial } from "react-native-usbserial";

export default new class FCConnector {

  detect() {
    //detect architecture
    //check serial
    //check wifi
    //check bluetooth
    return new Promise((resolve, reject) => {
      resolve(new class BuFInterface {
        // constructor() {
        //   // this._instance = usbSerialDeviceInstance; // fake info.
        // }
        sendAsync(command = "!\n") {
          // return this._instance.writeAsync(command);
        }
        close() {}
      }());
      // let usbs = new UsbSerial();
      // usbs.getDeviceListAsync().then(deviceList => {
      //     usbs.openDeviceAsync(deviceList[0]).then(usbSerialDeviceInstance => {
      //           if (usbSerialDeviceInstance) {
      //             resolve(new class BuFInterface {
      //               constructor() {
      //                 this._instance = usbSerialDeviceInstance; // fake info.
      //               }
      //               sendAsync(command = "!\n") {
      //                 return this._instance.writeAsync(command);
      //               }
      //               close() {}
      //             }())
      //           }
      //       }).catch(()=>{
      //         reject('failed to open');
      //       });
      //   }).catch(()=>{
      //     reject('failed to get list');
      //   });
    });
  }
}();

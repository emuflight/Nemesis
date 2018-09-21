/*
    STM32 F103 serial bus seems to properly initialize with quite a huge auto-baud range
    From 921600 down to 1200, i don't recommend getting any lower then that
    Official "specs" are from 115200 to 1200

    popular choices - 921600, 460800, 256000, 230400, 153600, 128000, 115200, 57600, 38400, 28800, 19200
*/

export const stm32DfuConfig = { vendorId: 1155, productId: 57105 };

export class STM32 {
  constructor() {
    this.baud;
    this.options = {};
    this.callback; // ref
    this.hex; // ref
    this.verify_hex;

    this.receive_buffer;

    this.bytes_to_read = 0; // ref
    this.read_callback; // ref

    this.upload_time_start;
    this.upload_process_alive;

    this.status = {
      ACK: 0x79, // y
      NACK: 0x1f
    };

    this.command = {
      get: 0x00, // Gets the version and the allowed commands supported by the current version of the bootloader
      get_ver_r_protect_s: 0x01, // Gets the bootloader version and the Read Protection status of the Flash memory
      get_ID: 0x02, // Gets the chip ID
      read_memory: 0x11, // Reads up to 256 bytes of memory starting from an address specified by the application
      go: 0x21, // Jumps to user application code located in the internal Flash memory or in SRAM
      write_memory: 0x31, // Writes up to 256 bytes to the RAM or Flash memory starting from an address specified by the application
      erase: 0x43, // Erases from one to all the Flash memory pages
      extended_erase: 0x44, // Erases from one to all the Flash memory pages using two byte addressing mode (v3.0+ usart).
      write_protect: 0x63, // Enables the write protection for some sectors
      write_unprotect: 0x73, // Disables the write protection for all Flash memory sectors
      readout_protect: 0x82, // Enables the read protection
      readout_unprotect: 0x92 // Disables the read protection
    };

    // Erase (x043) and Extended Erase (0x44) are exclusive. A device may support either the Erase command or the Extended Erase command but not both.

    this.available_flash_size = 0;
    this.page_size = 0;
    this.useExtendedErase = false;
  }

  connect(port, baud, hex, options, callback) {
    const self = this;
    self.hex = hex;
    self.baud = baud;
    self.callback = callback;

    // we will crunch the options here since doing it inside initialization routine would be too late
    self.options = {
      no_reboot: false,
      reboot_baud: false,
      erase_chip: false
    };

    if (options.no_reboot) {
      self.options.no_reboot = true;
    } else {
      self.options.reboot_baud = options.reboot_baud;
    }

    if (options.erase_chip) {
      self.options.erase_chip = true;
    }

    if (self.options.no_reboot) {
      serial.connect(
        port,
        { bitrate: self.baud, parityBit: "even", stopBits: "one" },
        openInfo => {
          if (openInfo) {
            // we are connected, disabling connect button in the UI
            //GUI.connect_lock = true;

            self.initialize();
          } else {
            console.log("serialPortOpenFail");
          }
        }
      );
    } else {
      serial.connect(
        port,
        { bitrate: self.options.reboot_baud },
        openInfo => {
          if (openInfo) {
            console.log('Sending ascii "R" to reboot');

            // we are connected, disabling connect button in the UI
            //GUI.connect_lock = true;

            const bufferOut = new ArrayBuffer(1);
            const bufferView = new Uint8Array(bufferOut);

            bufferView[0] = 0x52;

            serial.send(bufferOut, () => {
              serial.disconnect(result => {
                if (result) {
                  // delay to allow board to boot in bootloader mode
                  // required to detect if a DFU device appears
                  setTimeout(() => {
                    // refresh device list
                    PortHandler.check_usb_devices(dfu_available => {
                      if (dfu_available) {
                        STM32DFU.connect(
                          usbDevices.STM32DFU,
                          hex,
                          options
                        );
                      } else {
                        serial.connect(
                          port,
                          {
                            bitrate: self.baud,
                            parityBit: "even",
                            stopBits: "one"
                          },
                          openInfo => {
                            if (openInfo) {
                              self.initialize();
                            } else {
                              //GUI.connect_lock = false;
                              console.log("serialPortOpenFail");
                            }
                          }
                        );
                      }
                    });
                  }, 1000);
                } else {
                  //GUI.connect_lock = false;
                }
              });
            });
          } else {
            console.log("serialPortOpenFail");
          }
        }
      );
    }
  }

  initialize() {
    const self = this;

    // reset and set some variables before we start
    self.receive_buffer = [];
    self.verify_hex = [];

    self.upload_time_start = new Date().getTime();
    self.upload_process_alive = false;

    // reset progress bar to initial state
    // //self.progress_bar_e =// $('.progress');
    //     //self.progress_bar_e.val(0);
    // //self.progress_bar_e.removeClass('valid invalid');

    // lock some UI elements TODO needs rework
    // $('select[name="release"]').prop('disabled', true);

    serial.onReceive.addListener(info => {
      self.read(info);
    });

    let interval = setInterval(() => {
      if (self.upload_process_alive) {
        // process is running
        self.upload_process_alive = false;
      } else {
        console.log("STM32 - timed out, programming failed ...");

        // $('span.progressLabel').text('stm32TimedOut');
        // //self.progress_bar_e.addClass('invalid');

        // protocol got stuck, clear timer and disconnect
        clearInterval(interval);

        // exit
        self.upload_procedure(99);
      }
    }, 2000);

    self.upload_procedure(1);
  }

  read(readInfo) {
    // routine that fills the buffer
    const data = new Uint8Array(readInfo.data);

    for (let i = 0; i < data.length; i++) {
      this.receive_buffer.push(data[i]);
    }

    // routine that fetches data from buffer if statement is true
    if (
      this.receive_buffer.length >= this.bytes_to_read &&
      this.bytes_to_read != 0
    ) {
      const data = this.receive_buffer.slice(0, this.bytes_to_read); // bytes requested
      this.receive_buffer.splice(0, this.bytes_to_read); // remove read bytes

      this.bytes_to_read = 0; // reset trigger

      this.read_callback(data);
    }
  }

  retrieve(n_bytes, callback) {
    if (this.receive_buffer.length >= n_bytes) {
      // data that we need are there, process immediately
      const data = this.receive_buffer.slice(0, n_bytes);
      this.receive_buffer.splice(0, n_bytes); // remove read bytes

      callback(data);
    } else {
      // still waiting for data, add callback
      this.bytes_to_read = n_bytes;
      this.read_callback = callback;
    }
  }

  send(Array, bytes_to_read, callback) {
    // flip flag
    this.upload_process_alive = true;

    const bufferOut = new ArrayBuffer(Array.length);
    const bufferView = new Uint8Array(bufferOut);

    // set Array values inside bufferView (alternative to for loop)
    bufferView.set(Array);

    // update references
    this.bytes_to_read = bytes_to_read;
    this.read_callback = callback;

    // empty receive buffer before next command is out
    this.receive_buffer = [];

    // send over the actual data
    serial.send(bufferOut, writeInfo => {});
  }

  verify_response(val, data) {
    const self = this;

    if (val != data[0]) {
      const message = `STM32 Communication failed, wrong response, expected: ${val} (0x${val.toString(
        16
      )}) received: ${data[0]} (0x${data[0].toString(16)})`;
      console.error(message);
      // $('span.progressLabel').text(
      // i18n.getMessage('stm32WrongResponse', [val, val.toString(16), data[0], data[0].toString(16)])
      // );
      //self.progress_bar_e.addClass('invalid');

      // disconnect
      this.upload_procedure(99);

      return false;
    }

    return true;
  }

  verify_chip_signature(signature) {
    let message = "MCU: Not recognized";
    switch (signature) {
      case 0x412: // not tested
        message = "MCU: F1 LD";
        break;
      case 0x410:
        message = "MCU: F1 MD";
        this.available_flash_size = 131072;
        this.page_size = 1024;
        break;
      case 0x414:
        this.available_flash_size = 0x40000;
        this.page_size = 2048;
        message = "MCU: F1 HD";
        break;
      case 0x418: // not tested
        message = "MCU: F1 Connectivity line";
        break;
      case 0x420: // not tested
        message = "MCU: F1 MD value line";
        break;
      case 0x428: // not tested
        message = "MCU: F1 HD value line";
        break;
      case 0x430: // not tested
        message = "MCU: F1 XL-density value line";
        break;
      case 0x416: // not tested
        message = "MCU: L1 MD ultralow power";
        break;
      case 0x436: // not tested
        message = "MCU: L1 HD ultralow power";
        break;
      case 0x427: // not tested
        message = "MCU: L1 MD plus ultralow power";
        break;
      case 0x411: // not tested
        message = "MCU: F2 STM32F2xxxx";
        break;
      case 0x440: // not tested
        message = "MCU: F0 STM32F051xx";
        break;
      case 0x444: // not tested
        message = "MCU: F0 STM32F050xx";
        break;
      case 0x413: // not tested
        message = "MCU: F4 STM32F40xxx/41xxx";
        break;
      case 0x419: // not tested
        message = "MCU: F4 STM32F427xx/437xx, STM32F429xx/439xx";
        break;
      case 0x432: // not tested
        message = "MCU: F3 STM32F37xxx, STM32F38xxx";
        break;
      case 0x422:
        message = "MCU: F3 STM32F30xxx, STM32F31xxx";
        this.available_flash_size = 0x40000;
        this.page_size = 2048;
        break;
    }
    console.log(message);

    if (
      this.available_flash_size > 0 &&
      this.hex.bytes_total >= this.available_flash_size
    ) {
      return true;
    } else {
      message = `binary larger (${this.hex.bytes_total}) than flash (${
        this.available_flash_size
      })`;
      return false;
    }
    console.log(message);

    return false;
  }

  verify_flash(first_array, second_array) {
    for (let i = 0; i < first_array.length; i++) {
      if (first_array[i] != second_array[i]) {
        console.log(
          `Verification failed on byte: ${i} expected: 0x${first_array[
            i
          ].toString(16)} received: 0x${second_array[i].toString(16)}`
        );
        return false;
      }
    }

    console.log(
      `Verification successful, matching: ${first_array.length} bytes`
    );

    return true;
  }

  upload_procedure(step) {
    const self = this;

    switch (step) {
      case 1:
        // initialize serial interface on the MCU side, auto baud rate settings
        // $('span.progressLabel').text('stm32ContactingBootloader');

        let send_counter = 0;
        let interval = setInterval(
          () => {
            // 200 ms interval (just in case mcu was already initialized), we need to break the 2 bytes command requirement
            self.send([0x7f], 1, reply => {
              if (
                reply[0] == 0x7f ||
                reply[0] == self.status.ACK ||
                reply[0] == self.status.NACK
              ) {
                clearInterval(interval);
                console.log(
                  "STM32 - Serial interface initialized on the MCU side"
                );

                // proceed to next step
                self.upload_procedure(2);
              } else {
                // $('span.progressLabel').text('stm32ContactingBootloaderFailed');
                //self.progress_bar_e.addClass('invalid');

                clearInterval(interval);

                // disconnect
                self.upload_procedure(99);
              }
            });

            if (send_counter++ > 3) {
              // stop retrying, its too late to get any response from MCU
              console.log("STM32 - no response from bootloader, disconnecting");

              // $('span.progressLabel').text('stm32ResponseBootloaderFailed');
              //self.progress_bar_e.addClass('invalid');

              clearInterval(interval);
              clearInterval("STM32_timeout");

              // exit
              self.upload_procedure(99);
            }
          },
          250,
          true
        );
        break;
      case 2:
        // get version of the bootloader and supported commands
        self.send([self.command.get, 0xff], 2, data => {
          // 0x00 ^ 0xFF
          if (self.verify_response(self.status.ACK, data)) {
            self.retrieve(data[1] + 1 + 1, data => {
              // data[1] = number of bytes that will follow [– 1 except current and ACKs]
              console.log(
                `STM32 - Bootloader version: ${(
                  parseInt(data[0].toString(16)) / 10
                ).toFixed(1)}`
              ); // convert dec to hex, hex to dec and add floating point

              self.useExtendedErase = data[7] == self.command.extended_erase;

              // proceed to next step
              self.upload_procedure(3);
            });
          }
        });
        break;
      case 3:
        // get ID (device signature)
        self.send([self.command.get_ID, 0xfd], 2, data => {
          // 0x01 ^ 0xFF
          if (self.verify_response(self.status.ACK, data)) {
            self.retrieve(data[1] + 1 + 1, data => {
              // data[1] = number of bytes that will follow [– 1 (N = 1 for STM32), except for current byte and ACKs]
              const signature = (data[0] << 8) | data[1];
              console.log(`STM32 - Signature: 0x${signature.toString(16)}`); // signature in hex representation

              if (self.verify_chip_signature(signature)) {
                // proceed to next step
                self.upload_procedure(4);
              } else {
                // disconnect
                self.upload_procedure(99);
              }
            });
          }
        });
        break;
      case 4:
        // erase memory

        if (self.useExtendedErase) {
          if (self.options.erase_chip) {
            const message = "Executing global chip erase (via extended erase)";
            console.log(message);
            // $('span.progressLabel').text('stm32GlobalEraseExtended');

            self.send([self.command.extended_erase, 0xbb], 1, reply => {
              if (self.verify_response(self.status.ACK, reply)) {
                self.send([0xff, 0xff, 0x00], 1, reply => {
                  if (self.verify_response(self.status.ACK, reply)) {
                    console.log("Executing global chip extended erase: done");
                    self.upload_procedure(5);
                  }
                });
              }
            });
          } else {
            const message = "Executing local erase (via extended erase)";
            console.log(message);
            // $('span.progressLabel').text('stm32LocalEraseExtended');

            self.send([self.command.extended_erase, 0xbb], 1, reply => {
              if (self.verify_response(self.status.ACK, reply)) {
                // For reference: https://code.google.com/p/stm32flash/source/browse/stm32.c#723

                let max_address =
                    self.hex.data[self.hex.data.length - 1].address +
                    self.hex.data[self.hex.data.length - 1].bytes -
                    0x8000000,
                  erase_pages_n = Math.ceil(max_address / self.page_size),
                  buff = [],
                  checksum = 0;

                let pg_byte;

                pg_byte = (erase_pages_n - 1) >> 8;
                buff.push(pg_byte);
                checksum ^= pg_byte;
                pg_byte = (erase_pages_n - 1) & 0xff;
                buff.push(pg_byte);
                checksum ^= pg_byte;

                for (let i = 0; i < erase_pages_n; i++) {
                  pg_byte = i >> 8;
                  buff.push(pg_byte);
                  checksum ^= pg_byte;
                  pg_byte = i & 0xff;
                  buff.push(pg_byte);
                  checksum ^= pg_byte;
                }

                buff.push(checksum);
                console.log(
                  `Erasing. pages: 0x00 - 0x${erase_pages_n.toString(
                    16
                  )}, checksum: 0x${checksum.toString(16)}`
                );

                self.send(buff, 1, reply => {
                  if (self.verify_response(self.status.ACK, reply)) {
                    console.log("Erasing: done");
                    // proceed to next step
                    self.upload_procedure(5);
                  }
                });
              }
            });
          }
          break;
        }

        if (self.options.erase_chip) {
          const message = "Executing global chip erase";
          console.log(message);
          // $('span.progressLabel').text('stm32GlobalErase');

          self.send([self.command.erase, 0xbc], 1, reply => {
            // 0x43 ^ 0xFF
            if (self.verify_response(self.status.ACK, reply)) {
              self.send([0xff, 0x00], 1, reply => {
                if (self.verify_response(self.status.ACK, reply)) {
                  console.log("Erasing: done");
                  // proceed to next step
                  self.upload_procedure(5);
                }
              });
            }
          });
        } else {
          const message = "Executing local erase";
          console.log(message);
          // $('span.progressLabel').text('stm32LocalErase');

          self.send([self.command.erase, 0xbc], 1, reply => {
            // 0x43 ^ 0xFF
            if (self.verify_response(self.status.ACK, reply)) {
              // the bootloader receives one byte that contains N, the number of pages to be erased – 1
              let max_address =
                  self.hex.data[self.hex.data.length - 1].address +
                  self.hex.data[self.hex.data.length - 1].bytes -
                  0x8000000,
                erase_pages_n = Math.ceil(max_address / self.page_size),
                buff = [],
                checksum = erase_pages_n - 1;

              buff.push(erase_pages_n - 1);

              for (let i = 0; i < erase_pages_n; i++) {
                buff.push(i);
                checksum ^= i;
              }

              buff.push(checksum);

              self.send(buff, 1, reply => {
                if (self.verify_response(self.status.ACK, reply)) {
                  console.log("Erasing: done");
                  // proceed to next step
                  self.upload_procedure(5);
                }
              });
            }
          });
        }
        break;
      case 5:
        // upload
        console.log("Writing data ...");
        // $('span.progressLabel').text('stm32Flashing');

        let blocks = self.hex.data.length - 1,
          flashing_block = 0,
          address = self.hex.data[flashing_block].address,
          bytes_flashed = 0,
          bytes_flashed_total = 0; // used for progress bar

        const write = function() {
          if (bytes_flashed < self.hex.data[flashing_block].bytes) {
            const bytes_to_write =
              bytes_flashed + 256 <= self.hex.data[flashing_block].bytes
                ? 256
                : self.hex.data[flashing_block].bytes - bytes_flashed;

            // console.log('STM32 - Writing to: 0x' + address.toString(16) + ', ' + bytes_to_write + ' bytes');

            self.send([self.command.write_memory, 0xce], 1, reply => {
              // 0x31 ^ 0xFF
              if (self.verify_response(self.status.ACK, reply)) {
                // address needs to be transmitted as 32 bit integer, we need to bit shift each byte out and then calculate address checksum
                const address_arr = [
                  address >> 24,
                  address >> 16,
                  address >> 8,
                  address
                ];
                const address_checksum =
                  address_arr[0] ^
                  address_arr[1] ^
                  address_arr[2] ^
                  address_arr[3];

                self.send(
                  [
                    address_arr[0],
                    address_arr[1],
                    address_arr[2],
                    address_arr[3],
                    address_checksum
                  ],
                  1,
                  reply => {
                    // write start address + checksum
                    if (self.verify_response(self.status.ACK, reply)) {
                      const array_out = new Array(bytes_to_write + 2); // 2 byte overhead [N, ...., checksum]
                      array_out[0] = bytes_to_write - 1; // number of bytes to be written (to write 128 bytes, N must be 127, to write 256 bytes, N must be 255)

                      let checksum = array_out[0];
                      for (let i = 0; i < bytes_to_write; i++) {
                        array_out[i + 1] =
                          self.hex.data[flashing_block].data[bytes_flashed]; // + 1 because of the first byte offset
                        checksum ^=
                          self.hex.data[flashing_block].data[bytes_flashed];

                        bytes_flashed++;
                      }
                      array_out[array_out.length - 1] = checksum; // checksum (last byte in the array_out array)

                      address += bytes_to_write;
                      bytes_flashed_total += bytes_to_write;

                      self.send(array_out, 1, reply => {
                        if (self.verify_response(self.status.ACK, reply)) {
                          // flash another page
                          write();
                        }
                      });

                      // update progress bar
                      //self.progress_bar_e.val(Math.round(bytes_flashed_total / (self.hex.bytes_total * 2) * 100));
                    }
                  }
                );
              }
            });
          } else {
            // move to another block
            if (flashing_block < blocks) {
              flashing_block++;

              address = self.hex.data[flashing_block].address;
              bytes_flashed = 0;

              write();
            } else {
              // all blocks flashed
              console.log("Writing: done");

              // proceed to next step
              self.upload_procedure(6);
            }
          }
        };

        // start writing
        write();
        break;
      case 6:
        // verify
        console.log("Verifying data ...");
        // $('span.progressLabel').text('stm32Verifying');

        let blocks = self.hex.data.length - 1,
          reading_block = 0,
          address = self.hex.data[reading_block].address,
          bytes_verified = 0,
          bytes_verified_total = 0; // used for progress bar

        // initialize arrays
        for (let i = 0; i <= blocks; i++) {
          self.verify_hex.push([]);
        }

        const reading = function() {
          if (bytes_verified < self.hex.data[reading_block].bytes) {
            const bytes_to_read =
              bytes_verified + 256 <= self.hex.data[reading_block].bytes
                ? 256
                : self.hex.data[reading_block].bytes - bytes_verified;

            // console.log('STM32 - Reading from: 0x' + address.toString(16) + ', ' + bytes_to_read + ' bytes');

            self.send([self.command.read_memory, 0xee], 1, reply => {
              // 0x11 ^ 0xFF
              if (self.verify_response(self.status.ACK, reply)) {
                const address_arr = [
                  address >> 24,
                  address >> 16,
                  address >> 8,
                  address
                ];
                const address_checksum =
                  address_arr[0] ^
                  address_arr[1] ^
                  address_arr[2] ^
                  address_arr[3];

                self.send(
                  [
                    address_arr[0],
                    address_arr[1],
                    address_arr[2],
                    address_arr[3],
                    address_checksum
                  ],
                  1,
                  reply => {
                    // read start address + checksum
                    if (self.verify_response(self.status.ACK, reply)) {
                      const bytes_to_read_n = bytes_to_read - 1;

                      self.send(
                        [bytes_to_read_n, ~bytes_to_read_n & 0xff],
                        1,
                        reply => {
                          // bytes to be read + checksum XOR(complement of bytes_to_read_n)
                          if (self.verify_response(self.status.ACK, reply)) {
                            self.retrieve(bytes_to_read, data => {
                              for (let i = 0; i < data.length; i++) {
                                self.verify_hex[reading_block].push(data[i]);
                              }

                              address += bytes_to_read;
                              bytes_verified += bytes_to_read;
                              bytes_verified_total += bytes_to_read;

                              // verify another page
                              reading();
                            });
                          }
                        }
                      );

                      // update progress bar
                      //self.progress_bar_e.val(
                      //     Math.round((self.hex.bytes_total + bytes_verified_total) / (self.hex.bytes_total * 2) * 100)
                      // );
                    }
                  }
                );
              }
            });
          } else {
            // move to another block
            if (reading_block < blocks) {
              reading_block++;

              address = self.hex.data[reading_block].address;
              bytes_verified = 0;

              reading();
            } else {
              // all blocks read, verify

              let verify = true;
              for (let i = 0; i <= blocks; i++) {
                verify = self.verify_flash(
                  self.hex.data[i].data,
                  self.verify_hex[i]
                );

                if (!verify) break;
              }

              if (verify) {
                console.log("Programming: SUCCESSFUL");
                // $('span.progressLabel').text('stm32ProgrammingSuccessful');

                // update progress bar
                //self.progress_bar_e.addClass('valid');

                // proceed to next step
                self.upload_procedure(7);
              } else {
                console.log("Programming: FAILED");
                // $('span.progressLabel').text('stm32ProgrammingFailed');

                // update progress bar
                //self.progress_bar_e.addClass('invalid');

                // disconnect
                self.upload_procedure(99);
              }
            }
          }
        };

        // start reading
        reading();
        break;
      case 7:
        // go
        // memory address = 4 bytes, 1st high byte, 4th low byte, 5th byte = checksum XOR(byte 1, byte 2, byte 3, byte 4)
        console.log("Sending GO command: 0x8000000");

        self.send([self.command.go, 0xde], 1, reply => {
          // 0x21 ^ 0xFF
          if (self.verify_response(self.status.ACK, reply)) {
            const gt_address = 0x8000000,
              address = [
                gt_address >> 24,
                gt_address >> 16,
                gt_address >> 8,
                gt_address
              ],
              address_checksum =
                address[0] ^ address[1] ^ address[2] ^ address[3];

            self.send(
              [
                address[0],
                address[1],
                address[2],
                address[3],
                address_checksum
              ],
              1,
              reply => {
                if (self.verify_response(self.status.ACK, reply)) {
                  // disconnect
                  self.upload_procedure(99);
                }
              }
            );
          }
        });
        break;
      case 99:
        // disconnect
        clearInterval("STM32_timeout"); // stop STM32 timeout timer (everything is finished now)

        // close connection
        if (serial.connectionId) {
          serial.disconnect(self.cleanup);
        } else {
          self.cleanup();
        }

        break;
    }
  }

  cleanup() {
    PortUsage.reset();

    // unlocking connect button
    //GUI.connect_lock = false;

    // unlock some UI elements TODO needs rework
    // $('select[name="release"]').prop('disabled', false);

    // handle timing
    const timeSpent = new Date().getTime() - self.upload_time_start;

    console.log(`Script finished after: ${timeSpent / 1000} seconds`);

    if (self.callback) {
      self.callback();
    }
  }
}

/*
    USB DFU uses:
    control transfers for communicating
    recipient is interface
    request type is class

    Descriptors seems to be broken in current chrome.usb API implementation (writing this while using canary 37.0.2040.0

    General rule to remember is that DFU doesn't like running specific operations while the device isn't in idle state
    that being said, it seems that certain level of CLRSTATUS is required before running another type of operation for
    example switching from DNLOAD to UPLOAD, etc, clearning the state so device is in dfuIDLE is highly recommended.
*/

export class STM32DFU {
  constructor() {
    this.callback; // ref
    this.hex; // ref
    this.verify_hex;

    this.handle = null; // connection handle

    this.request = {
      DETACH: 0x00, // OUT, Requests the device to leave DFU mode and enter the application.
      DNLOAD: 0x01, // OUT, Requests data transfer from Host to the device in order to load them into device internal Flash. Includes also erase commands
      UPLOAD: 0x02, // IN,  Requests data transfer from device to Host in order to load content of device internal Flash into a Host file.
      GETSTATUS: 0x03, // IN,  Requests device to send status report to the Host (including status resulting from the last request execution and the state the device will enter immediately after this request).
      CLRSTATUS: 0x04, // OUT, Requests device to clear error status and move to next step
      GETSTATE: 0x05, // IN,  Requests the device to send only the state it will enter immediately after this request.
      ABORT: 0x06 // OUT, Requests device to exit the current state/operation and enter idle state immediately.
    };

    this.status = {
      OK: 0x00, // No error condition is present.
      errTARGET: 0x01, // File is not targeted for use by this device.
      errFILE: 0x02, // File is for this device but fails some vendor-specific verification test
      errWRITE: 0x03, // Device is unable to write memory.
      errERASE: 0x04, // Memory erase function failed.
      errCHECK_ERASED: 0x05, // Memory erase check failed.
      errPROG: 0x06, // Program memory function failed.
      errVERIFY: 0x07, // Programmed memory failed verification.
      errADDRESS: 0x08, // Cannot program memory due to received address that is out of range.
      errNOTDONE: 0x09, // Received DFU_DNLOAD with wLength = 0, but device does not think it has all of the data yet.
      errFIRMWARE: 0x0a, // Device's firmware is corrupt. It cannot return to run-time (non-DFU) operations.
      errVENDOR: 0x0b, // iString indicates a vendor-specific error.
      errUSBR: 0x0c, // Device detected unexpected USB reset signaling.
      errPOR: 0x0d, // Device detected unexpected power on reset.
      errUNKNOWN: 0x0e, // Something went wrong, but the device does not know what it was.
      errSTALLEDPKT: 0x0f // Device stalled an unexpected request.
    };

    this.state = {
      appIDLE: 0, // Device is running its normal application.
      appDETACH: 1, // Device is running its normal application, has received the DFU_DETACH request, and is waiting for a USB reset.
      dfuIDLE: 2, // Device is operating in the DFU mode and is waiting for requests.
      dfuDNLOAD_SYNC: 3, // Device has received a block and is waiting for the host to solicit the status via DFU_GETSTATUS.
      dfuDNBUSY: 4, // Device is programming a control-write block into its nonvolatile memories.
      dfuDNLOAD_IDLE: 5, // Device is processing a download operation. Expecting DFU_DNLOAD requests.
      dfuMANIFEST_SYNC: 6, // Device has received the final block of firmware from the host and is waiting for receipt of DFU_GETSTATUS to begin the Manifestation phase; or device has completed the Manifestation phase and is waiting for receipt of DFU_GETSTATUS.
      dfuMANIFEST: 7, // Device is in the Manifestation phase. (Not all devices will be able to respond to DFU_GETSTATUS when in this state.)
      dfuMANIFEST_WAIT_RESET: 8, // Device has programmed its memories and is waiting for a USB reset or a power on reset. (Devices that must enter this state clear bitManifestationTolerant to 0.)
      dfuUPLOAD_IDLE: 9, // The device is processing an upload operation. Expecting DFU_UPLOAD requests.
      dfuERROR: 10 // An error has occurred. Awaiting the DFU_CLRSTATUS request.
    };

    this.chipInfo = null; // information about chip's memory
    this.flash_layout = { start_address: 0, total_size: 0, sectors: [] };
  }

  connect(device, hex, options, callback) {
    const self = this;
    self.hex = hex;
    self.callback = callback;

    self.options = {
      erase_chip: false
    };

    if (options.erase_chip) {
      self.options.erase_chip = true;
    }

    // reset and set some variables before we start
    self.upload_time_start = new Date().getTime();
    self.verify_hex = [];

    // reset progress bar to initial state
    //self.progress_bar_e =// $('.progress');
    //self.progress_bar_e.val(0);
    //self.progress_bar_e.removeClass('valid invalid');

    chrome.usb.getDevices(device, result => {
      if (result.length) {
        console.log(`USB DFU detected with ID: ${result[0].device}`);

        self.openDevice(result[0]);
      } else {
        console.log("USB DFU not found");
        console.log("stm32UsbDfuNotFound");
      }
    });
  }

  checkChromeError() {
    if (chrome.runtime.lastError) {
      if (chrome.runtime.lastError.message)
        console.log(
          `reporting chrome error: ${chrome.runtime.lastError.message}`
        );
      else console.log(`reporting chrome error: ${chrome.runtime.lastError}`);

      return true;
    }

    return false;
  }

  openDevice(device) {
    const self = this;

    chrome.usb.openDevice(device, handle => {
      if (self.checkChromeError()) {
        console.log("Failed to open USB device!");
        console.log("usbDeviceOpenFail");
      }

      self.handle = handle;

      // console.log(i18n.getMessage('usbDeviceOpened', handle.handle.toString()));
      console.log(`Device opened with Handle ID: ${handle.handle}`);
      self.claimInterface(0);
    });
  }

  closeDevice() {
    const self = this;

    chrome.usb.closeDevice(this.handle, () => {
      if (self.checkChromeError()) {
        console.log("Failed to close USB device!");
        console.log("usbDeviceCloseFail");
      }

      console.log("usbDeviceClosed");
      console.log(`Device closed with Handle ID: ${self.handle.handle}`);

      self.handle = null;
    });
  }

  claimInterface(interfaceNumber) {
    const self = this;

    chrome.usb.claimInterface(this.handle, interfaceNumber, () => {
      if (self.checkChromeError()) {
        console.log("Failed to claim USB device!");
        self.upload_procedure(99);
      }

      console.log(`Claimed interface: ${interfaceNumber}`);

      self.upload_procedure(0);
    });
  }

  releaseInterface(interfaceNumber) {
    const self = this;

    chrome.usb.releaseInterface(this.handle, interfaceNumber, () => {
      console.log(`Released interface: ${interfaceNumber}`);

      self.closeDevice();
    });
  }

  resetDevice(callback) {
    chrome.usb.resetDevice(this.handle, result => {
      console.log(`Reset Device: ${result}`);

      if (callback) callback();
    });
  }

  getString(index, callback) {
    const self = this;

    chrome.usb.controlTransfer(
      self.handle,
      {
        direction: "in",
        recipient: "device",
        requestType: "standard",
        request: 6,
        value: 0x300 | index,
        index: 0, // specifies language
        length: 255 // max length to retreive
      },
      result => {
        if (self.checkChromeError()) {
          console.log(`USB transfer failed! ${result.resultCode}`);
          callback("", result.resultCode);
          return;
        }
        const view = new DataView(result.data);
        const length = view.getUint8(0);
        let descriptor = "";
        for (let i = 2; i < length; i += 2) {
          const charCode = view.getUint16(i, true);
          descriptor += String.fromCharCode(charCode);
        }
        callback(descriptor, result.resultCode);
      }
    );
  }

  getInterfaceDescriptors(interfaceNum, callback) {
    const self = this;

    chrome.usb.getConfiguration(this.handle, config => {
      if (self.checkChromeError()) {
        console.log("USB getConfiguration failed!");
        callback([], -200);
        return;
      }

      let interfaceID = 0;
      const descriptorStringArray = [];
      const getDescriptorString = function() {
        if (interfaceID < config.interfaces.length) {
          self.getInterfaceDescriptor(interfaceID, (descriptor, resultCode) => {
            if (resultCode) {
              callback([], resultCode);
              return;
            }
            interfaceID++;
            self.getString(
              descriptor.iInterface,
              (descriptorString, resultCode) => {
                if (resultCode) {
                  callback([], resultCode);
                  return;
                }
                if (descriptor.bInterfaceNumber == interfaceNum) {
                  descriptorStringArray.push(descriptorString);
                }
                getDescriptorString();
              }
            );
          });
        } else {
          //console.log(descriptorStringArray);
          callback(descriptorStringArray, 0);
          return;
        }
      };
      getDescriptorString();
    });
  }

  getInterfaceDescriptor(_interface, callback) {
    const self = this;
    chrome.usb.controlTransfer(
      this.handle,
      {
        direction: "in",
        recipient: "device",
        requestType: "standard",
        request: 6,
        value: 0x200,
        index: 0,
        length: 18 + _interface * 9
      },
      result => {
        if (self.checkChromeError()) {
          console.log(`USB transfer failed! ${result.resultCode}`);
          callback({}, result.resultCode);
          return;
        }

        const buf = new Uint8Array(result.data, 9 + _interface * 9);
        const descriptor = {
          bLength: buf[0],
          bDescriptorType: buf[1],
          bInterfaceNumber: buf[2],
          bAlternateSetting: buf[3],
          bNumEndpoints: buf[4],
          bInterfaceClass: buf[5],
          bInterfaceSubclass: buf[6],
          bInterfaceProtocol: buf[7],
          iInterface: buf[8]
        };

        callback(descriptor, result.resultCode);
      }
    );
  }

  getChipInfo(_interface, callback) {
    const self = this;

    self.getInterfaceDescriptors(0, (descriptors, resultCode) => {
      if (resultCode) {
        callback({}, resultCode);
        return;
      }

      const parseDescriptor = function(str) {
        // F303: "@Internal Flash  /0x08000000/128*0002Kg"
        // F40x: "@Internal Flash  /0x08000000/04*016Kg,01*064Kg,07*128Kg"
        // F72x: "@Internal Flash  /0x08000000/04*016Kg,01*64Kg,03*128Kg"
        // F74x: "@Internal Flash  /0x08000000/04*032Kg,01*128Kg,03*256Kg"
        // split main into [location, start_addr, sectors]
        const tmp0 = str.replace(/[^\x20-\x7E]+/g, "");
        const tmp1 = tmp0.split("/");
        if (tmp1.length != 3 || !tmp1[0].startsWith("@")) {
          return null;
        }
        const type = tmp1[0].trim().replace("@", "");
        const start_address = parseInt(tmp1[1]);

        // split sectors into array
        const sectors = [];
        let total_size = 0;
        const tmp2 = tmp1[2].split(",");
        if (tmp2.length < 1) {
          return null;
        }
        for (let i = 0; i < tmp2.length; i++) {
          // split into [num_pages, page_size]
          const tmp3 = tmp2[i].split("*");
          if (tmp3.length != 2) {
            return null;
          }
          const num_pages = parseInt(tmp3[0]);
          let page_size = parseInt(tmp3[1]);
          if (!page_size) {
            return null;
          }
          const unit = tmp3[1].slice(-2, -1);
          switch (unit) {
            case "M":
              page_size *= 1024; //  fall through to K as well
            case "K":
              page_size *= 1024;
              break;
            /*		    case ' ':
                                    break;
                                            default:
                                                return null;
                        */
          }

          sectors.push({
            num_pages: num_pages,
            start_address: start_address + total_size,
            page_size: page_size,
            total_size: num_pages * page_size
          });

          total_size += num_pages * page_size;
        }

        const memory = {
          type: type,
          start_address: start_address,
          sectors: sectors,
          total_size: total_size
        };
        return memory;
      };
      let chipInfo = descriptors.map(parseDescriptor).reduce((o, v, i) => {
        o[v.type.toLowerCase().replace(" ", "_")] = v;
        return o;
      }, {});
      callback(chipInfo, resultCode);
    });
  }

  controlTransfer(
    direction,
    request,
    value,
    _interface,
    length,
    data,
    callback,
    _timeout
  ) {
    const self = this;

    // timeout support was added in chrome v43
    let timeout;
    if (typeof _timeout === "undefined") {
      timeout = 0; // default is 0 (according to chrome.usb API)
    } else {
      timeout = _timeout;
    }

    if (direction == "in") {
      // data is ignored
      chrome.usb.controlTransfer(
        this.handle,
        {
          direction: "in",
          recipient: "interface",
          requestType: "class",
          request: request,
          value: value,
          index: _interface,
          length: length,
          timeout: timeout
        },
        result => {
          if (self.checkChromeError()) {
            console.log("USB transfer failed!");
          }
          if (result.resultCode)
            console.log(`USB transfer result code: ${result.resultCode}`);

          const buf = new Uint8Array(result.data);
          callback(buf, result.resultCode);
        }
      );
    } else {
      // length is ignored
      if (data) {
        const arrayBuf = new ArrayBuffer(data.length);
        const arrayBufView = new Uint8Array(arrayBuf);
        arrayBufView.set(data);
      } else {
        const arrayBuf = new ArrayBuffer(0);
      }

      chrome.usb.controlTransfer(
        this.handle,
        {
          direction: "out",
          recipient: "interface",
          requestType: "class",
          request: request,
          value: value,
          index: _interface,
          data: arrayBuf,
          timeout: timeout
        },
        result => {
          if (self.checkChromeError()) {
            console.log("USB transfer failed!");
          }
          if (result.resultCode)
            console.log(`USB transfer result code: ${result.resultCode}`);

          callback(result);
        }
      );
    }
  }

  clearStatus(callback) {
    const self = this;

    function check_status() {
      self.controlTransfer("in", self.request.GETSTATUS, 0, 0, 6, 0, data => {
        if (data[4] == self.state.dfuIDLE) {
          callback(data);
        } else {
          const delay = data[1] | (data[2] << 8) | (data[3] << 16);

          setTimeout(clear_status, delay);
        }
      });
    }

    function clear_status() {
      self.controlTransfer(
        "out",
        self.request.CLRSTATUS,
        0,
        0,
        0,
        0,
        check_status
      );
    }

    check_status();
  }

  loadAddress(address, callback, abort) {
    const self = this;

    self.controlTransfer(
      "out",
      self.request.DNLOAD,
      0,
      0,
      0,
      [0x21, address, address >> 8, address >> 16, address >> 24],
      () => {
        self.controlTransfer("in", self.request.GETSTATUS, 0, 0, 6, 0, data => {
          if (data[4] == self.state.dfuDNBUSY) {
            const delay = data[1] | (data[2] << 8) | (data[3] << 16);

            setTimeout(() => {
              self.controlTransfer(
                "in",
                self.request.GETSTATUS,
                0,
                0,
                6,
                0,
                data => {
                  if (data[4] == self.state.dfuDNLOAD_IDLE) {
                    callback(data);
                  } else {
                    console.log("Failed to execute address load");
                    if (typeof abort === "undefined" || abort) {
                      self.upload_procedure(99);
                    } else {
                      callback(data);
                    }
                  }
                }
              );
            }, delay);
          } else {
            console.log("Failed to request address load");
            self.upload_procedure(99);
          }
        });
      }
    );
  }

  verify_flash(first_array, second_array) {
    for (let i = 0; i < first_array.length; i++) {
      if (first_array[i] != second_array[i]) {
        console.log(
          `Verification failed on byte: ${i} expected: 0x${first_array[
            i
          ].toString(16)} received: 0x${second_array[i].toString(16)}`
        );
        return false;
      }
    }

    console.log(
      `Verification successful, matching: ${first_array.length} bytes`
    );

    return true;
  }

  upload_procedure(step) {
    const self = this;

    switch (step) {
      case 0:
        self.getChipInfo(0, (chipInfo, resultCode) => {
          if (resultCode != 0 || typeof chipInfo === "undefined") {
            console.log(
              `Failed to detect chip info, resultCode: ${resultCode}`
            );
            self.upload_procedure(99);
          } else {
            if (typeof chipInfo.internal_flash === "undefined") {
              console.log("Failed to detect internal flash");
              self.upload_procedure(99);
            }

            self.chipInfo = chipInfo;

            self.flash_layout = chipInfo.internal_flash;
            self.available_flash_size =
              self.flash_layout.total_size -
              (self.hex.start_linear_address - self.flash_layout.start_address);

            // console.log(
            //     i18n.getMessage('dfu_device_flash_info', (self.flash_layout.total_size / 1024).toString())
            // );

            if (self.hex.bytes_total > self.available_flash_size) {
              // console.log(i18n.getMessage('dfu_error_image_size',
              //     [(self.hex.bytes_total / 1024.0).toFixed(1),
              //     (self.available_flash_size / 1024.0).toFixed(1)]));
              self.upload_procedure(99);
            } else {
              self.clearStatus(() => {
                self.upload_procedure(1);
              });
            }
          }
        });
        break;
      case 1:
        if (typeof self.chipInfo.option_bytes === "undefined") {
          console.log("Failed to detect option bytes");
          self.upload_procedure(99);
        }

        const unprotect = function() {
          console.log("Initiate read unprotect");
          console.log("stm32ReadProtected");
          // $('span.progressLabel').text('stm32ReadProtected');
          //self.progress_bar_e.addClass('actionRequired');

          self.controlTransfer(
            "out",
            self.request.DNLOAD,
            0,
            0,
            0,
            [0x92],
            () => {
              // 0x92 initiates read unprotect
              self.controlTransfer(
                "in",
                self.request.GETSTATUS,
                0,
                0,
                6,
                0,
                data => {
                  if (data[4] == self.state.dfuDNBUSY) {
                    // completely normal
                    const delay = data[1] | (data[2] << 8) | (data[3] << 16);
                    const total_delay = delay + 20000; // wait at least 20 seconds to make sure the user does not disconnect the board while erasing the memory
                    let timeSpentWaiting = 0;
                    const incr = 1000; // one sec incements
                    const waitForErase = setInterval(() => {
                      //self.progress_bar_e.val(Math.min(timeSpentWaiting / total_delay, 1) * 100);
                      if (timeSpentWaiting < total_delay) {
                        timeSpentWaiting += incr;
                        return;
                      }
                      clearInterval(waitForErase);
                      self.controlTransfer(
                        "in",
                        self.request.GETSTATUS,
                        0,
                        0,
                        6,
                        0,
                        (data, error) => {
                          // should stall/disconnect
                          if (error) {
                            // we encounter an error, but this is expected. should be a stall.
                            console.log(
                              "Unprotect memory command ran successfully. Unplug flight controller. Connect again in DFU mode and try flashing again."
                            );
                            console.log("stm32UnprotectSuccessful");
                            console.log("stm32UnprotectUnplug");
                            // $('span.progressLabel').text('stm32UnprotectUnplug');
                            //self.progress_bar_e.val(0);
                            //self.progress_bar_e.addClass('actionRequired');
                          } else {
                            // unprotecting the flight controller did not work. It did not reboot.
                            console.log(
                              "Failed to execute unprotect memory command"
                            );
                            console.log("stm32UnprotectFailed");
                            // $('span.progressLabel').text('stm32UnprotectFailed');
                            //self.progress_bar_e.addClass('invalid');
                            console.log(data);
                            self.upload_procedure(99);
                          }
                        },
                        2000
                      ); // this should stall/disconnect anyways. so we only wait 2 sec max.
                    }, incr);
                  } else {
                    console.log("Failed to initiate unprotect memory command");
                    console.log("stm32UnprotectInitFailed");
                    // $('span.progressLabel').text('stm32UnprotectInitFailed');
                    //self.progress_bar_e.addClass('invalid');
                    self.upload_procedure(99);
                  }
                }
              );
            }
          );
        };

        const tryReadOB = function() {
          // the following should fail if read protection is active
          self.controlTransfer(
            "in",
            self.request.UPLOAD,
            2,
            0,
            self.chipInfo.option_bytes.total_size,
            0,
            (ob_data, errcode) => {
              if (errcode) {
                console.log(
                  `USB transfer error while reading option bytes: ${errcode1}`
                );
                self.upload_procedure(99);
                return;
              }
              self.controlTransfer(
                "in",
                self.request.GETSTATUS,
                0,
                0,
                6,
                0,
                data => {
                  if (
                    data[4] == self.state.dfuUPLOAD_IDLE &&
                    ob_data.length == self.chipInfo.option_bytes.total_size
                  ) {
                    console.log("Option bytes read successfully");
                    console.log("Chip does not appear read protected");
                    console.log("stm32NotReadProtected");
                    // it is pretty safe to continue to erase flash
                    self.clearStatus(() => {
                      self.upload_procedure(2);
                    });
                    /* // this snippet is to protect the flash memory (only for the brave)
                                    ob_data[1] = 0x0;
                                    var writeOB = function() {
                                        self.controlTransfer('out', self.request.DNLOAD, 2, 0, 0, ob_data, function () {
                                            self.controlTransfer('in', self.request.GETSTATUS, 0, 0, 6, 0, function (data) {
                                                if (data[4] == self.state.dfuDNBUSY) {
                                                var delay = data[1] | (data[2] << 8) | (data[3] << 16);
        
                                                setTimeout(function () {
                                                    self.controlTransfer('in', self.request.GETSTATUS, 0, 0, 6, 0, function (data) {
                                                    if (data[4] == self.state.dfuDNLOAD_IDLE) {
                                                        console.log('Failed to write ob');
                                                        self.upload_procedure(99);								    
                                                    } else {
                                                        console.log('Success writing ob');
                                                        self.upload_procedure(99);
                                                    }
                                                    });
                                                }, delay);
                                                } else {
                                                console.log('Failed to initiate write ob');
                                                self.upload_procedure(99);
                                                }
                                            });
                                        });
                                    }
                                    self.clearStatus(function () {
                                        self.loadAddress(self.chipInfo.option_bytes.start_address, function () {
                                            self.clearStatus(writeOB);
                                        });
                                    }); // */
                  } else {
                    console.log(
                      "Option bytes could not be read. Quite possibly read protected."
                    );
                    self.clearStatus(unprotect);
                  }
                }
              );
            }
          );
        };

        const initReadOB = function(loadAddressResponse) {
          // contrary to what is in the docs. Address load should in theory work even if read protection is active
          // if address load fails with this specific error though, it is very likely bc of read protection
          if (
            loadAddressResponse[4] == self.state.dfuERROR &&
            loadAddressResponse[0] == self.status.errVENDOR
          ) {
            // read protected
            console.log("stm32AddressLoadFailed");
            self.clearStatus(unprotect);
            return;
          } else if (loadAddressResponse[4] == self.state.dfuDNLOAD_IDLE) {
            console.log("Address load for option bytes sector succeeded.");
            self.clearStatus(tryReadOB);
          } else {
            console.log("stm32AddressLoadUnknown");
            self.upload_procedure(99);
          }
        };

        self.clearStatus(() => {
          // load address fails if read protection is active unlike as stated in the docs
          self.loadAddress(
            self.chipInfo.option_bytes.start_address,
            initReadOB,
            false
          );
        });
        break;
      case 2:
        // erase
        // find out which pages to erase
        const erase_pages = [];
        for (let i = 0; i < self.flash_layout.sectors.length; i++) {
          for (let j = 0; j < self.flash_layout.sectors[i].num_pages; j++) {
            if (self.options.erase_chip) {
              // full chip erase
              erase_pages.push({ sector: i, page: j });
            } else {
              // local erase
              const page_start =
                self.flash_layout.sectors[i].start_address +
                j * self.flash_layout.sectors[i].page_size;
              const page_end =
                page_start + self.flash_layout.sectors[i].page_size - 1;
              for (let k = 0; k < self.hex.data.length; k++) {
                const starts_in_page =
                  self.hex.data[k].address >= page_start &&
                  self.hex.data[k].address <= page_end;
                const end_address =
                  self.hex.data[k].address + self.hex.data[k].bytes - 1;
                const ends_in_page =
                  end_address >= page_start && end_address <= page_end;
                const spans_page =
                  self.hex.data[k].address < page_start &&
                  end_address > page_end;
                if (starts_in_page || ends_in_page || spans_page) {
                  const idx = erase_pages.findIndex((element, index, array) => {
                    return element.sector == i && element.page == j;
                  });
                  if (idx == -1) erase_pages.push({ sector: i, page: j });
                }
              }
            }
          }
        }
        // $('span.progressLabel').text('stm32Erase');
        console.log("Executing local chip erase");

        let page = 0;
        let total_erased = 0; // bytes

        const erase_page = function() {
          const page_addr =
            erase_pages[page].page *
              self.flash_layout.sectors[erase_pages[page].sector].page_size +
            self.flash_layout.sectors[erase_pages[page].sector].start_address;
          const cmd = [
            0x41,
            page_addr & 0xff,
            (page_addr >> 8) & 0xff,
            (page_addr >> 16) & 0xff,
            (page_addr >> 24) & 0xff
          ];
          total_erased +=
            self.flash_layout.sectors[erase_pages[page].sector].page_size;
          console.log(
            `Erasing. sector ${erase_pages[page].sector}, page ${
              erase_pages[page].page
            } @ 0x${page_addr.toString(16)}`
          );

          self.controlTransfer("out", self.request.DNLOAD, 0, 0, 0, cmd, () => {
            self.controlTransfer(
              "in",
              self.request.GETSTATUS,
              0,
              0,
              6,
              0,
              data => {
                if (data[4] == self.state.dfuDNBUSY) {
                  // completely normal
                  const delay = data[1] | (data[2] << 8) | (data[3] << 16);

                  setTimeout(() => {
                    self.controlTransfer(
                      "in",
                      self.request.GETSTATUS,
                      0,
                      0,
                      6,
                      0,
                      data => {
                        if (data[4] == self.state.dfuDNLOAD_IDLE) {
                          // update progress bar
                          //self.progress_bar_e.val((page + 1) / erase_pages.length * 100);
                          page++;

                          if (page == erase_pages.length) {
                            console.log("Erase: complete");
                            // console.log(i18n.getMessage('dfu_erased_kilobytes', (total_erased / 1024).toString()));
                            self.upload_procedure(4);
                          } else erase_page();
                        } else {
                          console.log(
                            `Failed to erase page 0x${page_addr.toString(16)}`
                          );
                          self.upload_procedure(99);
                        }
                      }
                    );
                  }, delay);
                } else {
                  console.log(
                    `Failed to initiate page erase, page 0x${page_addr.toString(
                      16
                    )}`
                  );
                  self.upload_procedure(99);
                }
              }
            );
          });
        };

        // start
        erase_page();
        break;

      case 4:
        // upload
        // we dont need to clear the state as we are already using DFU_DNLOAD
        console.log("Writing data ...");
        // $('span.progressLabel').text('stm32Flashing');

        const blocks = self.hex.data.length - 1;
        let flashing_block = 0;
        let address = self.hex.data[flashing_block].address;

        let bytes_flashed = 0;
        let bytes_flashed_total = 0; // used for progress bar
        let wBlockNum = 2; // required by DFU

        const write = function() {
          if (bytes_flashed < self.hex.data[flashing_block].bytes) {
            const bytes_to_write =
              bytes_flashed + 2048 <= self.hex.data[flashing_block].bytes
                ? 2048
                : self.hex.data[flashing_block].bytes - bytes_flashed;

            const data_to_flash = self.hex.data[flashing_block].data.slice(
              bytes_flashed,
              bytes_flashed + bytes_to_write
            );

            address += bytes_to_write;
            bytes_flashed += bytes_to_write;
            bytes_flashed_total += bytes_to_write;

            self.controlTransfer(
              "out",
              self.request.DNLOAD,
              wBlockNum++,
              0,
              0,
              data_to_flash,
              () => {
                self.controlTransfer(
                  "in",
                  self.request.GETSTATUS,
                  0,
                  0,
                  6,
                  0,
                  data => {
                    if (data[4] == self.state.dfuDNBUSY) {
                      const delay = data[1] | (data[2] << 8) | (data[3] << 16);

                      setTimeout(() => {
                        self.controlTransfer(
                          "in",
                          self.request.GETSTATUS,
                          0,
                          0,
                          6,
                          0,
                          data => {
                            if (data[4] == self.state.dfuDNLOAD_IDLE) {
                              // update progress bar
                              //self.progress_bar_e.val(bytes_flashed_total / (self.hex.bytes_total * 2) * 100);

                              // flash another page
                              write();
                            } else {
                              console.log(
                                `Failed to write ${bytes_to_write}bytes to 0x${address.toString(
                                  16
                                )}`
                              );
                              self.upload_procedure(99);
                            }
                          }
                        );
                      }, delay);
                    } else {
                      console.log(
                        `Failed to initiate write ${bytes_to_write}bytes to 0x${address.toString(
                          16
                        )}`
                      );
                      self.upload_procedure(99);
                    }
                  }
                );
              }
            );
          } else {
            if (flashing_block < blocks) {
              // move to another block
              flashing_block++;

              address = self.hex.data[flashing_block].address;
              bytes_flashed = 0;
              wBlockNum = 2;

              self.loadAddress(address, write);
            } else {
              // all blocks flashed
              console.log("Writing: done");

              // proceed to next step
              self.upload_procedure(5);
            }
          }
        };

        // start
        self.loadAddress(address, write);

        break;
      case 5:
        // verify
        console.log("Verifying data ...");
        // $('span.progressLabel').text('stm32Verifying');

        const blocks = self.hex.data.length - 1;
        let reading_block = 0;
        let address = self.hex.data[reading_block].address;

        let bytes_verified = 0;
        let bytes_verified_total = 0; // used for progress bar
        let wBlockNum = 2; // required by DFU

        // initialize arrays
        for (let i = 0; i <= blocks; i++) {
          self.verify_hex.push([]);
        }

        // start
        self.clearStatus(() => {
          self.loadAddress(address, () => {
            self.clearStatus(read);
          });
        });

        const read = function() {
          if (bytes_verified < self.hex.data[reading_block].bytes) {
            const bytes_to_read =
              bytes_verified + 2048 <= self.hex.data[reading_block].bytes
                ? 2048
                : self.hex.data[reading_block].bytes - bytes_verified;

            self.controlTransfer(
              "in",
              self.request.UPLOAD,
              wBlockNum++,
              0,
              bytes_to_read,
              0,
              (data, code) => {
                for (let i = 0; i < data.length; i++) {
                  self.verify_hex[reading_block].push(data[i]);
                }

                address += bytes_to_read;
                bytes_verified += bytes_to_read;
                bytes_verified_total += bytes_to_read;

                // update progress bar
                //self.progress_bar_e.val(
                //     (self.hex.bytes_total + bytes_verified_total) / (self.hex.bytes_total * 2) * 100
                // );

                // verify another page
                read();
              }
            );
          } else {
            if (reading_block < blocks) {
              // move to another block
              reading_block++;

              address = self.hex.data[reading_block].address;
              bytes_verified = 0;
              wBlockNum = 2;

              self.clearStatus(() => {
                self.loadAddress(address, () => {
                  self.clearStatus(read);
                });
              });
            } else {
              // all blocks read, verify

              let verify = true;
              for (let i = 0; i <= blocks; i++) {
                verify = self.verify_flash(
                  self.hex.data[i].data,
                  self.verify_hex[i]
                );

                if (!verify) break;
              }

              if (verify) {
                console.log("Programming: SUCCESSFUL");
                // $('span.progressLabel').text('stm32ProgrammingSuccessful');

                // update progress bar
                //self.progress_bar_e.addClass('valid');

                // proceed to next step
                self.upload_procedure(6);
              } else {
                console.log("Programming: FAILED");
                // $('span.progressLabel').text('stm32ProgrammingFailed');

                // update progress bar
                //self.progress_bar_e.addClass('invalid');

                // disconnect
                self.upload_procedure(99);
              }
            }
          }
        };
        break;
      case 6:
        // jump to application code
        const address = self.hex.data[0].address;

        self.clearStatus(() => {
          self.loadAddress(address, leave);
        });

        const leave = function() {
          self.controlTransfer("out", self.request.DNLOAD, 0, 0, 0, 0, () => {
            self.controlTransfer(
              "in",
              self.request.GETSTATUS,
              0,
              0,
              6,
              0,
              data => {
                self.upload_procedure(99);
              }
            );
          });
        };

        break;
      case 99:
        // cleanup
        self.releaseInterface(0);

        //GUI.connect_lock = false;

        const timeSpent = new Date().getTime() - self.upload_time_start;

        console.log(`Script finished after: ${timeSpent / 1000} seconds`);

        if (self.callback) self.callback();
        break;
    }
  }
}

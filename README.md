# Nemesis - the HelioRC/Pegasus fork
Death of Sol :(

## Linux, one O.S. to rule them all.
Edit/create `udev` rules: (use vi, nano, or any text editor)
```
sudo nano /etc/udev/rules.d/50-myusb.rules
```
Copy/paste the contents and save it:
```
SUBSYSTEM=="usb", ATTRS{idVendor}=="0483", ATTRS{idProduct}=="5742", GROUP="users", MODE="0664"
SUBSYSTEM=="tty", ATTRS{idVendor}=="0483", ATTRS{idProduct}=="5742", GROUP="users", MODE="0664"
SUBSYSTEM=="usb", ATTRS{idVendor}=="0483", ATTRS{idProduct}=="df11", GROUP="users"  MODE="0664"
```

Then run
```
sudo udevadm control --reload
```
add yourself to the dialout group for tty/serial permissions

```
sudo usermod -a -G dialout $USER
#logout/login, or:

#temporary group membership for this shell session:
newgrp dialout
```

To use the `AppImage`:
```
chmod +x Nemesis*.AppImage
/Nemesis*.AppImage
```
If it fails to fully run properly, then extract the contents and run directly:
```
./Nemesis*.AppImage --appimage-extract
cd sqaush-fs
./pegasus
```

### Linux Development - requires nodejs, npm, and obsolete packages.

```
#libudev-dev is essential for USB (nodejs' usb)
sudo apt-get install build-essential git libudev-dev nodejs npm yarn

#git clone https://github.com/heliorc/pegasus.git
git clone https://github.com/emuflight/Nemesis.git

#cd pegasus
cd Nemesis

#purge/reset nodejs packages if you installed updated versions by accident
git reset HEAD --hard
rm -rf node_modules/

#set python2
npm config set python /usr/bin/python2.7

#install required obsolete packages
npm install --save --save-exact  #installs exact versions, not updated packages

#install peers that are not installed by default
#npm install electron@~5.0.0  #failed w/ v5
npm install electron@~4.0.0
npm install ajv@~6.9.1

#disable annoying desktop shortcut creation for election apps
touch $HOME/.local/share/appimagekit/no_desktopintegration

#run in dev-mode
npm run build -l
npm run electron-dev

#if it fails to run dev-mode, then
#compile it (nicely so CPU doesn't spike)
nice -n 19 npm run electron-pack-lin

#run it
chmod +x dist/Nemesis*.AppImage
./dist/Nemesis-0.2.1-x86_64.AppImage
```

other npm options:
`npm run OPTION` , where OPTION is:
```
build      electron-dev      electron-pack-lin  precommit         pretty  test
build-css  electron-dev-win  electron-pack-win  preelectron-pack  ship    watch-css
eject      electron-pack     install            preship           start
```


## MacOS, the bastardized O.S. formerly known as BSD

install libusb, npm and yarn using brew
```
brew install libusb npm yarn
```

clone the repository
```
git clone https://github.com/emuflight/Nemesis.git
cd Nemesis
```

set up node v12 and set python 2.7
```
npm config set python /usr/bin/python2.7
npm install -g n
sudo n 12 # sets node version 12
```

install peer dependencies not automatically installed
```
npm install ajv@6.12.2 electron@4.2.12 node-sass@4.14.1 electron-builder@22.7.0 node-hid@0.7.9 electron-updater@4.3.1 usb@1.6.1
```

install rest of dependencies
```
npm install --save --save-exact  #installs exact versions, not updated packages
```

start development version
```
npm run electron-dev
```


## Windows, meh.

If your target device is not HID, you _must_ install a driver before you can communicate with it using libusb. Currently, this means installing one of Microsoft's `WinUSB`, [libusb-win32](http://sourceforge.net/apps/trac/libusb-win32/wiki) or [libusbK](http://libusbk.sourceforge.net/UsbK3/index.html) drivers. Two options are available:
* _Recommended_: Use the most recent version of _[Zadig](http://zadig.akeo.ie)_, an Automated Driver Installer GUI application for `WinUSB`, `libusb-win32` and `libusbK`...
* Alternatively, if you are only interested in `WinUSB`, you can download the [WinUSB driver files](https://storage.googleapis.com/google-code-archive-downloads/v2/code.google.com/libusb-winusb-wip/winusb%20driver.zip) and customize the `inf` file for your device.
* For version 1.0.21 or later, you can also use usbdk backend. [usbdk](https://cgit.freedesktop.org/spice/win32/usbdk) provides another driver option for libusb Windows backend. For 1.0.21, usbdk is a compile-time option, but it becomes a runtime option from version 1.0.22 onwards, so you need to specify the usbdk backend using something like the following.
```
libusb_context * ctx = NULL;
libusb_init(&ctx);
libusb_set_option(ctx, LIBUSB_OPTION_USE_USBDK);
```

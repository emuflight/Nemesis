# Nemesis - the HelioRC/Pegasus fork
Death of Sol :(

## Linux, one O.S. to rule them all.
Edit/create `udev` rules: (use vi, nano, or any text editor)
```
sudo nano /etc/udev/rules.d/50-myusb.rules
```
Copy/paste the contents and save it:
```
# ALL STMicroelectronics devices & DFU
SUBSYSTEM=="usb", ATTRS{idVendor}=="0483", ATTRS{idProduct}=="****", GROUP="users", MODE="0664"
SUBSYSTEM=="tty", ATTRS{idVendor}=="0483", ATTRS{idProduct}=="****", GROUP="users", MODE="0664"
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
./nemesis
```

### Linux Development - requires nodejs, npm, and obsolete packages.

```
#install build tools
#libudev-dev is essential for USB (nodejs' usb)
sudo apt-get install build-essential git libudev-dev nodejs npm yarn

git clone https://github.com/emuflight/Nemesis.git

cd Nemesis

#currently npm v6 required
npm install -g npm@6  #in some cases may need sudo

#set python2
npm config set python /usr/bin/python2.7

#set node version 12
npm install -g n    #in some cases may need sudo
sudo n 12           #sets node version 12

#occasionally purge node_modules when versions cause problem.
rm -rf node_modules/

#install required node modules
npm install --include=dev

#run in dev-mode
rm -rf ./build/
npm run build && npm run electron-dev

#compile to unpacked binary
# results in ./dist/linux-unpacked/nemesis
rm -rf ./build/
npm run build && npm run electron-pack
ls -lh ./build/

#compile to AppImage 
rm -rf ./build/
rm -rf ./dist/
npm run build && npm run electron-pack && npm run dist
ls -h ./dist/

#disable annoying desktop shortcut creation for election apps
touch $HOME/.local/share/appimagekit/no_desktopintegration

#run it
chmod +x dist/Nemesis*.AppImage
./dist/Nemesis-*.AppImage
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

install required node modules
```
npm install --include=dev
```

start development version
```
npm run electron-dev
```

install electron builder to be able to build executable
```
npm install electron-builder --save-dev
```

build app (results in ./dist/mac)
```
npm run build
npm run electron-pack
```

## Windows, meh.

This guide assumes you have git installed and working on your machine: 
```
https://git-scm.com/download/win
```

Install Node.js 12 for Windows.
This particular Node.js version is required. If you have other versions of Node installed, consider using nvm to manage multiple installs
```
https://nodejs.org/dist/latest-v12.x/node-v12.20.0-x64.msi
```

git clone the repository (or your fork):
```
git clone https://github.com/emuflight/Nemesis.git
cd Nemesis
```

Install Windows build tools. (run from either administrative command prompt, or powershell with admin rights)
```
 npm install -g --production windows-build-tools --vs2015
```

Install Yarn, Configure python, install node modules (this part can be done from regular command line):
```
npm install yarn
npm config set python %USERPROFILE%\.windows-build-tools\python27\python.exe
npm install --include=dev
```

start development version
```
npm run electron-dev-win
```

install electron builder to be able to build executable
```
npm install electron-builder --save-dev
```

build app (results in ./dist/win-unpacked)
```
npm run build
npm run electron-pack
```

## Previous Windows build notes 
(these were not needed on fresh install of Windows 10 / x64 as of Dec 3, 2020)
If your target device is not HID, you _must_ install a driver before you can communicate with it using libusb. Currently, this means installing one of Microsoft's `WinUSB`, [libusb-win32](http://sourceforge.net/apps/trac/libusb-win32/wiki) or [libusbK](http://libusbk.sourceforge.net/UsbK3/index.html) drivers. Two options are available:
* _Recommended_: Use the most recent version of _[Zadig](http://zadig.akeo.ie)_, an Automated Driver Installer GUI application for `WinUSB`, `libusb-win32` and `libusbK`...
* Alternatively, if you are only interested in `WinUSB`, you can download the [WinUSB driver files](https://storage.googleapis.com/google-code-archive-downloads/v2/code.google.com/libusb-winusb-wip/winusb%20driver.zip) and customize the `inf` file for your device.
* For version 1.0.21 or later, you can also use usbdk backend. [usbdk](https://cgit.freedesktop.org/spice/win32/usbdk) provides another driver option for libusb Windows backend. For 1.0.21, usbdk is a compile-time option, but it becomes a runtime option from version 1.0.22 onwards, so you need to specify the usbdk backend using something like the following.
```
libusb_context * ctx = NULL;
libusb_init(&ctx);
libusb_set_option(ctx, LIBUSB_OPTION_USE_USBDK);
```

## Global `git` Tips
```
git config --global core.autocrlf input
git config --global core.whitespace cr-at-eol
```
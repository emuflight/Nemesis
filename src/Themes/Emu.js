import { createMuiTheme } from "@material-ui/core/styles";
import red from "@material-ui/core/colors/red";

/* 
    from EmuConfig theme:
    --accent: #288fda;
    --subtleAccent: #9c9c9c;
    --quietHeader: #5e6772b2;
    --defaultText: #dddddd;
    --subtleText: #c2c2c2;
    --mutedText: #d1d1d1;
    --boxBackground: #393b3a;
    --alternativeBackground: #4e4e4e;
    --sideBackground: #404040;
    --paper: url(../../images/paper-dark.jpg);
    --ledAccent: #6e6e6e;
    --ledBackground: #424242;

*/

const EmuPrimary = {
  50: "#fef2e4",
  100: "#fddfbc",
  200: "#fbc98f",
  300: "#f9b362",
  400: "#f8a340",
  500: "#f7931e",
  600: "#f68b1a",
  700: "#f58016",
  800: "#f37612",
  900: "#f1640a",
  A100: "#ffffff",
  A200: "#ffefe7",
  A400: "#ffceb4",
  A700: "#ffbd9b",
  contrastDefaultColor: "dark"
};

const theme = createMuiTheme({
  typography: {
    useNextVariants: true
  },
  palette: {
    type: "dark",
    primary: EmuPrimary,
    secondary: red
  },
  overrides: {
    MuiLinearProgress: {
      bar: {
        transition: "transform 0.1s linear"
      },
      bar1Determinate: {
        transition: "transform 0.1s linear"
      },
      bar2Determinate: {
        transition: "transform 0.1s linear"
      }
    },
    MuiSwitch: {
      colorSecondary: {
        "&$checked": {
          color: EmuPrimary[500],
          "& + $bar": {
            backgroundColor: EmuPrimary[500]
          }
        }
      }
    },
    MuiPaper: {
      root: {
        margin: 10,
        padding: 10
      }
    },
    MuiAppBar: {
      positionFixed: {
        margin: 0
      }
    },
    MuiDrawer: {
      paperAnchorLeft: {
        margin: 0
      }
    },
    MuiSlider: {
      root: {
        padding: 0,
        marginTop: 10,
        height: 10
      },
      track: {
        "& + $vertical": {
          left: "0 !important"
        }
      },
      vertical: {
        left: "0 !important",
        "& + $track": {
          left: "0 !important"
        }
      }
    }
  }
});
theme.modelUrl = "assets/gatesman.stl";
export default theme;

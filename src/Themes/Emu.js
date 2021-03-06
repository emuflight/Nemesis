import { createMuiTheme } from "@material-ui/core/styles";
//import lightBlue from "@material-ui/core/colors/lightBlue";

const EmuPrimary = {
  50: "#E5F2FB",
  100: "#BFDDF4",
  200: "#94C7ED",
  300: "#69B1E5",
  400: "#48A0E0",
  500: "#288FDA",
  600: "#2487D6",
  700: "#1E7CD0",
  800: "#1872CB",
  900: "#0F60C2",
  A100: "#F0F6FF",
  A200: "#BDD8FF",
  A400: "#8ABAFF",
  A700: "#70ABFF",
  contrastDefaultColor: "dark"
};

const EmuSecondary = {
  50: "#E5F2FB",
  100: "#BFDDF4",
  200: "#94C7ED",
  300: "#69B1E5",
  400: "#48A0E0",
  500: "#288FDA",
  600: "#2487D6",
  700: "#1E7CD0",
  800: "#1872CB",
  900: "#0F60C2",
  A100: "#F0F6FF",
  A200: "#BDD8FF",
  A400: "#8ABAFF",
  A700: "#70ABFF",
  contrastDefaultColor: "dark"
};

const theme = createMuiTheme({
  typography: {
    useNextVariants: true
  },
  palette: {
    type: "dark",
    primary: EmuPrimary,
    secondary: EmuSecondary
  },
  overrides: {
    MuiLinearProgress: {
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
          color: EmuPrimary[500]
        }
      }
    },
    MuiPaper: {
      root: {
        margin: 10,
        padding: 10,
        backgroundColor: "transparent"
      },
      elevation1: {
        boxShadow: 0
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
theme.modelUrl = "assets/AndreyCustom.stl";
export default theme;

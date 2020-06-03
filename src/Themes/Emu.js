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
  50: "#FBFBE4",
  100: "#F5F4BB",
  200: "#EFED8D",
  300: "#E8E55F",
  400: "#E3E03D",
  500: "#DEDA1B",
  600: "#DAD618",
  700: "#D5D014",
  800: "#D1CB10",
  900: "#C8C208",
  A100: "#FFFFF2",
  A200: "#FFFDBF",
  A400: "#DEDA1B",
  A700: "#FFFA73",
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
theme.modelUrl = "assets/AndreyCustom.stl";
export default theme;

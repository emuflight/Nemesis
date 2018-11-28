import { createMuiTheme } from "@material-ui/core/styles";
import grey from "@material-ui/core/colors/grey";
const rfRed = {
  50: "#f6e4e3",
  100: "#e8bbb9",
  200: "#d98d8b",
  300: "#ca5f5c",
  400: "#be3d39",
  500: "#b31b16",
  600: "#ac1813",
  700: "#a31410",
  800: "#9a100c",
  900: "#8b0806",
  A100: "#ffb8b8",
  A200: "#ff8685",
  A400: "#ff5352",
  A700: "#ff3a38",
  contrastDefaultColor: "light"
};
const theme = createMuiTheme({
  typography: {
    useNextVariants: true
  },
  palette: {
    type: "dark",
    primary: rfRed,
    secondary: grey
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
    MuiInput: {
      root: {
        // color: grey[900]
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

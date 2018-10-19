import { createMuiTheme } from "@material-ui/core/styles";
import red from "@material-ui/core/colors/red";

const butterPrimary = {
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
    primary: butterPrimary,
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
          color: butterPrimary[500],
          "& + $bar": {
            backgroundColor: butterPrimary[500]
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
        width: 150,
        marginTop: 10,
        height: 10
      },
      vertical: {
        width: 0
      }
    }
  }
});
theme.modelUrl = "assets/gatesman.stl";
export default theme;

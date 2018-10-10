import { createMuiTheme } from "@material-ui/core/styles";
import red from "@material-ui/core/colors/red";

const common = {
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
};

const mode2Primary = {
  50: "#fce7e7",
  100: "#f7c4c2",
  200: "#f29c9a",
  300: "#ed7472",
  400: "#e95753",
  500: "#e53935",
  600: "#e23330",
  700: "#de2c28",
  800: "#da2422",
  900: "#d31716",
  A100: "#ffffff",
  A200: "#ffd1d1",
  A400: "#ff9f9e",
  A700: "#ff8585",
  contrastDefaultColor: "light"
};

export default {
  MODE2FLUX: createMuiTheme(
    Object.assign({}, common, {
      logo: "",
      palette: {
        primary: mode2Primary,
        secondary: red,
        type: "dark"
      },
      MuiSwitch: {
        colorSecondary: {
          "&$checked": {
            color: mode2Primary[500],
            "& + $bar": {
              backgroundColor: mode2Primary[500]
            }
          }
        }
      }
    })
  )
};

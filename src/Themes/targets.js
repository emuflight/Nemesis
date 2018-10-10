import { createMuiTheme } from "@material-ui/core/styles";
// import red from "@material-ui/core/colors/red";

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

const srixF10Primary = {
  50: "#fdede7",
  100: "#fbd1c4",
  200: "#f9b39c",
  300: "#f69574",
  400: "#f47e57",
  500: "#f26739",
  600: "#f05f33",
  700: "#ee542c",
  800: "#ec4a24",
  900: "#e83917",
  A100: "#ffffff",
  A200: "#ffeae6",
  A400: "#ffbdb3",
  A700: "#ffa79a",
  contrastDefaultColor: "dark"
};

const strixF10Secondary = {
  50: "#ededed",
  100: "#d1d1d1",
  200: "#b3b3b3",
  300: "#949595",
  400: "#7d7e7e",
  500: "#666767",
  600: "#5e5f5f",
  700: "#535454",
  800: "#494a4a",
  900: "#383939",
  A100: "#9cf5f5",
  A200: "#6df0f0",
  A400: "#2bffff",
  A700: "#12ffff",
  contrastDefaultColor: "light"
};

export default {
  MODE2FLUX: createMuiTheme(
    Object.assign({}, common, {
      logo: "",
      palette: {
        primary: mode2Primary,
        secondary: mode2Primary,
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
  ),
  STRIXF10: createMuiTheme(
    Object.assign({}, common, {
      logo: "",
      palette: {
        primary: srixF10Primary,
        secondary: strixF10Secondary,
        type: "dark"
      },
      MuiSwitch: {
        colorSecondary: {
          "&$checked": {
            color: strixF10Secondary[500],
            "& + $bar": {
              backgroundColor: strixF10Secondary[500]
            }
          }
        }
      }
    })
  )
};

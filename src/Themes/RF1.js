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
  palette: {
    type: "dark",
    primary: rfRed,
    secondary: grey
  },
  overrides: {
    MuiInput: {
      root: {
        // color: grey[900]
      }
    }
  }
});

export default theme;

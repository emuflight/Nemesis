import { createMuiTheme } from "@material-ui/core/styles";
import red from "@material-ui/core/colors/red";
import grey from "@material-ui/core/colors/grey";

const theme = createMuiTheme({
  palette: {
    type: "dark",
    primary: red,
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

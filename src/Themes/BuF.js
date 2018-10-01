import { createMuiTheme } from "@material-ui/core/styles";
import amber from "@material-ui/core/colors/amber";
import red from "@material-ui/core/colors/red";
// import grey from '@material-ui/core/colors/grey';

const theme = createMuiTheme({
  palette: {
    type: "dark",
    primary: amber,
    secondary: red
  },
  overrides: {
    MuiSwitch: {
      colorSecondary: {
        "&$checked": {
          color: amber[500],
          "& + $bar": {
            backgroundColor: amber[500]
          }
        }
      }
    }
  }
});

export default theme;

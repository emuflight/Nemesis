import { createMuiTheme } from "@material-ui/core/styles";
import cyan from "@material-ui/core/colors/cyan";
import deepOrange from "@material-ui/core/colors/deepOrange";
// import grey from '@material-ui/core/colors/grey';

const theme = createMuiTheme({
  palette: {
    type: "dark",
    primary: cyan,
    secondary: deepOrange
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

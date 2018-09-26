import { createMuiTheme } from "@material-ui/core/styles";
import cyan from "@material-ui/core/colors/cyan";
// import grey from '@material-ui/core/colors/grey';

const theme = createMuiTheme({
  palette: {
    type: "dark",
    primary: cyan
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

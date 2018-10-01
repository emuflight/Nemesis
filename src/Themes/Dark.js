import { createMuiTheme } from "@material-ui/core/styles";
import cyan from "@material-ui/core/colors/cyan";
import deepOrange from "@material-ui/core/colors/deepOrange";
// import grey from '@material-ui/core/colors/grey';
import ButterFlight from "./BuF";
import RACEFLIGHT from "./RF1";

const dark = createMuiTheme({
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

export default {
  dark,
  ButterFlight,
  RACEFLIGHT
};

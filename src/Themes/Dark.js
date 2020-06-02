import { createMuiTheme } from "@material-ui/core/styles";
import cyan from "@material-ui/core/colors/cyan";
import deepOrange from "@material-ui/core/colors/deepOrange";
//import grey from '@material-ui/core/colors/grey';
//import ButterFlight from "./BuF";
//import RACEFLIGHT from "./RF1";
import targetThemes from "./targets";
import EmuFlight from "./Emu";
const dark = createMuiTheme({
  typography: {
    useNextVariants: true
  },
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
  },
  MuiPaper: {
    root: {
      margin: 10,
      padding: 10
    }
  }
});

export default Object.assign(
  {
    dark,
    //ButterFlight,
    //Betaflight: ButterFlight,
    //RACEFLIGHT,
    EmuFlight
  },
  targetThemes
);

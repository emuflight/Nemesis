import React, { Component } from "react";
import List from "@material-ui/core/List";
import AuxChannelItemView from "./AuxChannelItemView";
import Paper from "@material-ui/core/Paper";
import FCConnector from "../../utilities/FCConnector";
import { FormattedMessage } from "react-intl";
import Typography from "@material-ui/core/Typography";
import "./NewAuxChannelView.css";
//==============
import { makeStyles } from "@material-ui/core/styles";
import { withStyles } from "@material-ui/styles";
import Accordion from "@material-ui/core/Accordion"; // move this to component
import AccordionDetails from "@material-ui/core/AccordionDetails";
import AccordionSummary from "@material-ui/core/AccordionSummary";
import AccordionActions from "@material-ui/core/AccordionActions";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import Chip from "@material-ui/core/Chip";
import Divider from "@material-ui/core/Divider";
import Button from "@material-ui/core/Button";
import clsx from "clsx";

//==============

// <AuxChannelView
// fcConfig={mergedProfile}
// auxScale={mergedProfile.rx_scale}
// auxModeList={mergedProfile.aux_channel_modes}
// modes={mergedProfile.modes && mergedProfile.modes.values}
// notifyDirty={(isDirty, item, newValue) =>
//   this.notifyDirty(isDirty, item, newValue)
// }
// />

export default class NewAuxChannelView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      channels: [],
      modes: [],
      modeMappings: []
    };
  }

  //state
  /*
  const [channels, setChannels] = useState([]);
  const [modes, setModes] = useState([]);
  const [modeMappings, setModeMappings] = useState([]);
  */
  //const classes = useStyles(); // move to component

  handleRXData = message => {
    try {
      let { rx } = JSON.parse(message.data);
      if (rx) {
        this.setState({ channels: rx.channels });
      }
    } catch (ex) {
      console.warn("unable to parse telemetry", ex);
    }
  };

  //TODO: rename processedModes to something else.
  //function to create map of each mode, and its config
  mapModes = () => {
    let mappedAuxModes = this.props.auxModeList;
    let modes = this.state.modes;
    for (var i = 0; i < modes.length; i++) {
      let mode = modes[i];
      let auxModeID = mode["auxId"] + 1;
      //TODO support multiple mappings?
      mappedAuxModes[auxModeID]["mappings"] = {
        id: mode["id"],
        channel: mode["channel"],
        range: mode["range"]
      };
    }

    this.setState({ modeMappings: mappedAuxModes });
  };

  componentDidMount() {
    if (!this.state.modes) {
      FCConnector.getModes().then(modes => {
        this.setState({ modes: modes });
      });
    }
    this.mapModes();
    FCConnector.webSockets.addEventListener("message", this.handleRXData);
    //temp disabled for debugging - allows modes in react view to not refresh constantly
    //FCConnector.startTelemetry("rx");
  }

  componentWillUnmount() {
    FCConnector.webSockets.removeEventListener("message", this.handleRXData);
    FCConnector.stopFastTelemetry();
  }

  render() {
    return (
      <Paper>
        <List>
          {this.state.modeMappings &&
            this.state.modeMappings.slice(1).map((auxMode, i) => {
              return (
                <Accordion>
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel1c-content"
                    id="panel1c-header"
                  >
                    <div className="column">
                      <Typography className="heading">
                        <FormattedMessage id={auxMode.label} />
                      </Typography>
                    </div>
                    <div className="column">
                      <Typography className="secondaryHeading">
                        <FormattedMessage id="aux.select.channel" />
                      </Typography>
                    </div>
                  </AccordionSummary>
                  <AccordionDetails className="details">
                    <div className="column" />
                    <div className="column">
                      <Chip label="{mode.channel}" onDelete={() => {}} />
                    </div>
                    <div className="column helper">
                      <Typography variant="caption">
                        Explanation of flight mode
                        <br />
                        <a
                          href="#secondary-heading-and-columns"
                          className="link"
                        >
                          Learn more
                        </a>
                      </Typography>
                    </div>
                  </AccordionDetails>
                  <Divider />
                  <AccordionActions>
                    <Button size="small">Cancel</Button>
                    <Button size="small" color="primary">
                      Save
                    </Button>
                  </AccordionActions>
                </Accordion>
              );
            })}
        </List>
      </Paper>
    );
  }
}

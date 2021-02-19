import React, { Component } from "react";
import List from "@material-ui/core/List";
import AuxChannelItemView from "./AuxChannelItemView";
import Paper from "@material-ui/core/Paper";
import FCConnector from "../../utilities/FCConnector";
import { FormattedMessage } from "react-intl";
import Typography from "@material-ui/core/Typography";

//==============
import { makeStyles } from "@material-ui/core/styles";
import Accordion from "@material-ui/core/Accordion"; // move this to component
import AccordionDetails from "@material-ui/core/AccordionDetails";
import AccordionSummary from "@material-ui/core/AccordionSummary";
import AccordionActions from "@material-ui/core/AccordionActions";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import Chip from "@material-ui/core/Chip";
import Divider from "@material-ui/core/Divider";
import Button from "@material-ui/core/Button";
import clsx from "clsx";
const useStyles = makeStyles(theme => ({
  root: {
    width: "100%"
  },
  heading: {
    fontSize: theme.typography.pxToRem(15)
  },
  secondaryHeading: {
    fontSize: theme.typography.pxToRem(15),
    color: theme.palette.text.secondary
  },
  icon: {
    verticalAlign: "bottom",
    height: 20,
    width: 20
  },
  details: {
    alignItems: "center"
  },
  column: {
    flexBasis: "33.33%"
  },
  helper: {
    borderLeft: `2px solid ${theme.palette.divider}`,
    padding: theme.spacing(1, 2)
  },
  link: {
    color: theme.palette.primary.main,
    textDecoration: "none",
    "&:hover": {
      textDecoration: "underline"
    }
  }
}));
const classes = useStyles(); // move to component
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
      channels: []
    };
  }

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

  componentDidMount() {
    if (!this.state.modes) {
      FCConnector.getModes().then(modes => {
        this.setState({ modes: modes });
      });
    }
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
          {this.props.auxModeList &&
            this.props.auxModeList.map((mode, i) => {
              return (
                <Accordion defaultExpanded>
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel1c-content"
                    id="panel1c-header"
                  >
                    <div className={classes.column}>
                      <Typography className={classes.heading}>
                        Location
                      </Typography>
                    </div>
                    <div className={classes.column}>
                      <Typography className={classes.secondaryHeading}>
                        Select trip destination
                      </Typography>
                    </div>
                  </AccordionSummary>
                  <AccordionDetails className={classes.details}>
                    <div className={classes.column} />
                    <div className={classes.column}>
                      <Chip label="Barbados" onDelete={() => {}} />
                    </div>
                    <div className={clsx(classes.column, classes.helper)}>
                      <Typography variant="caption">
                        Select your destination of choice
                        <br />
                        <a
                          href="#secondary-heading-and-columns"
                          className={classes.link}
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
                  <Typography
                    style={{ marginBottom: 12 }}
                    color="textSecondary"
                  >
                    <FormattedMessage id={mode.label} />
                  </Typography>
                </Accordion>
              );
            })}
        </List>
      </Paper>
    );
  }
}

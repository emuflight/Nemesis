import React, { Component } from "react";
import { FormattedMessage } from "react-intl";
import Typography from "@material-ui/core/Typography";
import "./AuxModeView.css";
import Accordion from "@material-ui/core/Accordion";
import AccordionDetails from "@material-ui/core/AccordionDetails";
import AccordionSummary from "@material-ui/core/AccordionSummary";
import AccordionActions from "@material-ui/core/AccordionActions";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import Chip from "@material-ui/core/Chip";
import Divider from "@material-ui/core/Divider";
import Button from "@material-ui/core/Button";
import { Slider } from "@material-ui/core";
import HelperSelect from "../Items/HelperSelect";
import DeleteIcon from "@material-ui/icons/Delete";
import AddCircleOutlineIcon from "@material-ui/icons/AddCircleOutline";
import { IconButton } from "@material-ui/core";
import Grid from "@material-ui/core/Grid";
import Tooltip from "@material-ui/core/Tooltip";
import FCConnector from "../../utilities/FCConnector";
import "./ModeItemView.css";
const use_cli_directly = true; // enable this to write any changes (move slider, channel) directly to the cli. set to false to use a list in parent component state to later be saved to the CLI (not working)
// this means any changes in this tab will be written to CLI, even if save is not pressed on this tab. They will save the next time save is pressed.
// this is the functionality of every other page as well

export default class ModeItemView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      mappings: this.props.auxMode.mappings
    };
  }

  updateValue(index) {
    this.setState({ isDirty: true });
    let mapping = this.state.mappings[index];
    mapping["mode"] = this.props.auxMode.value; // mode id

    if (use_cli_directly) {
      FCConnector.setMode(this.state.mappings[index]).then(() => {
        //this.setState({ isDirty: false });
        this.props.notifyDirty(true, this.state.mappings[index]);
      });
    } else {
      this.props.updateMapping(this.state.mappings[index]);
      this.props.notifyDirty(true, this.state.mappings[index]);
    }
  }

  addRange() {
    let available_auxID = this.props.getAvailableAuxID();
    //console.log("got available aux id: ", available_auxID);
    if (available_auxID === -1) {
      this.props.openNoAvailableAuxIDError();
      return 0;
    }

    let key = this.state.mappings.length; // set React key to list length. ie, fourth item = 4.
    let created_mapping = {
      key: key, // find best way to set a new key. available aux_id?
      id: available_auxID,
      mode: this.props.auxMode.value,
      channel: 0,
      range: [900, 900]
    };

    FCConnector.setMode(created_mapping).then(() => {
      //push created mapping, then run state update code
      var newmappings = this.state.mappings;
      newmappings.push(created_mapping);
      this.setState({ mappings: newmappings.slice() });
      this.setState({ isDirty: true }); // also set info changed here
      this.props.notifyDirty(true, this.state);
      this.updateValue(key); // what will the index be??
    });
  }

  deleteRange(index) {
    //get id of mapping (index)
    let id_was = this.state.mappings[index].id;
    //find a command to set this aux id back to default
    let default_mapping = {
      id: id_was,
      mode: 0,
      channel: 0,
      range: [900, 900]
    }; //prepare mapping that matches default

    FCConnector.setMode(default_mapping).then(() => {
      //push default mapping, effectively deleting the mapping
      //this.setState({ isDirty: false });
      this.props.notifyDirty(true, this.state.mappings[index]);
      var newmappings = this.state.mappings;
      newmappings.splice(index, 1);
      this.setState({ mappings: newmappings.slice() });
      this.setState({ isDirty: true }); // also set info changed here
      this.props.removeUsedAuxID(id_was);
    });
  }

  channelChange = (index, value) => {
    this.setState(
      previousState => {
        const mappings = [...previousState.mappings];
        mappings[index].channel = value;
        return { mappings };
      },
      () => {
        //callback
        this.updateValue(index);
      }
    );
  };

  sliderChange = (index, value) => {
    // TODO: combine these so that no code is repeated
    if (value[0] > value[1]) {
      [value[1], value[0]] = [value[0], value[1]]; //swap them, ensuring first number is the lower one
    }
    this.setState(previousState => {
      const mappings = [...previousState.mappings];
      mappings[index].range = value;
      return { mappings };
    });
  };

  sliderChangeCommitted = (index, value) => {
    if (value[0] > value[1]) {
      [value[1], value[0]] = [value[0], value[1]]; //swap them, ensuring first number is the lower one
    }
    this.setState(
      previousState => {
        const mappings = [...previousState.mappings];
        mappings[index].range = value;
        return { mappings };
      },
      () => {
        //callback
        this.updateValue(index);
      }
    );
  };

  render() {
    return (
      <Accordion
        defaultExpanded={this.state.mappings && this.state.mappings.length > 0}
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel1c-content"
          id="panel1c-header"
        >
          <Grid container spacing={3}>
            <Grid item xs={9}>
              <Typography className="heading">
                <FormattedMessage
                  id={`aux.title.${this.props.auxMode.label}`}
                />
                {false && (
                  <Chip
                    size="small"
                    color="primary"
                    label="Active"
                    style={{ marginLeft: "10px" }}
                  />
                )}
              </Typography>
            </Grid>
            <Grid item xs={1} />
            <Grid item xs={12} style={{ marginTop: "-24px" }}>
              <Typography className="secondaryHeading">
                <FormattedMessage
                  id={`aux.explanation.${this.props.auxMode.label}`}
                />
                <a
                  href="#secondary-heading-and-columns"
                  style={{ color: "#288FDA", marginLeft: "10px" }}
                  className="link"
                >
                  Learn more
                </a>
              </Typography>
            </Grid>
          </Grid>
        </AccordionSummary>

        {this.state.mappings &&
          this.state.mappings.map((mapping, i) => {
            let sliderLeft = 0;
            var active_mode = false;
            //set telemetry min and max

            if (mapping.channel > -1 && this.props.telemetry) {
              sliderLeft =
                ((this.props.telemetry[mapping.channel] - this.props.min) *
                  100) /
                (this.props.max - this.props.min);
              if (
                this.props.telemetry[mapping.channel] > mapping.range[0] &&
                this.props.telemetry[mapping.channel] < mapping.range[1]
              ) {
                active_mode = true;
              } else {
                active_mode = false;
              }
            }
            return (
              <AccordionDetails
                className={active_mode ? "active-mode details" : "details"}
                key={mapping.key}
              >
                <Grid container spacing={1}>
                  <Grid item xs>
                    <HelperSelect
                      id={this.props.id}
                      className={this.props.id}
                      label="Channel"
                      value={
                        this.props.channels.filter(
                          c => c.value === mapping.channel
                        )[0].value
                      }
                      items={this.props.channels}
                      onChange={(event, value) => {
                        this.channelChange(i, value.props.value); // the channel object has the channel number in its value
                        this.setState({ isDirty: true }); // also set info changed here
                      }}
                    />
                  </Grid>
                  <Grid item xs>
                    <Typography
                      style={{ margin: "20px", fontFamily: "inherit" }}
                    >
                      {this.props.min}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <ExpandMoreIcon //should not be grid item
                      style={{
                        position: "relative",
                        left: `${sliderLeft}%`
                      }}
                      color="secondary"
                      fontSize="large"
                    />
                    <Slider
                      aria-labelledby="range-slider"
                      value={[mapping.range[0], mapping.range[1]]}
                      min={this.props.min}
                      max={this.props.max}
                      marks
                      step={this.props.step}
                      valueLabelDisplay="on"
                      onChange={(event, value) => this.sliderChange(i, value)}
                      onChangeCommitted={(event, value) =>
                        this.sliderChangeCommitted(i, value)
                      } // onChangeCommitted == mouseUp
                    />
                  </Grid>
                  <Grid item xs>
                    <Typography style={{ margin: "20px" }}>
                      {this.props.max}
                    </Typography>
                  </Grid>
                  <Grid item xs>
                    <Tooltip title="Delete range">
                      <IconButton
                        aria-label="delete"
                        size="small"
                        style={{ marginTop: "20px" }}
                        onClick={() => this.deleteRange(i)}
                      >
                        <DeleteIcon style={{ fontSize: 18 }} />
                      </IconButton>
                    </Tooltip>
                    {i === this.state.mappings.length - 1 && (
                      <Tooltip title="Add another range">
                        <IconButton
                          aria-label="add"
                          size="small"
                          style={{ marginTop: "20px" }}
                          name="add_range"
                          onClick={() => this.addRange()}
                          color="primary"
                          variant="contained"
                        >
                          <AddCircleOutlineIcon />
                        </IconButton>
                      </Tooltip>
                    )}
                  </Grid>
                </Grid>
              </AccordionDetails>
            );
          })}
        <Divider />
        <AccordionActions>
          {this.state.mappings &&
            this.state.mappings.length === 0 && (
              <Tooltip title="Add a range to start using this mode.">
                <IconButton
                  aria-label="add"
                  name="add_range"
                  onClick={() => this.addRange()}
                  color="primary"
                  variant="contained"
                >
                  <AddCircleOutlineIcon />
                </IconButton>
              </Tooltip>
            )}
          <Tooltip title="Bring mode back to saved state">
            <Button size="small">Reset</Button>
          </Tooltip>
        </AccordionActions>
      </Accordion>
    );
  }
}

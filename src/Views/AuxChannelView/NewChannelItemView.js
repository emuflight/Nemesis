import React, { Component } from "react";
import List from "@material-ui/core/List";
import { FormattedMessage } from "react-intl";
import Typography from "@material-ui/core/Typography";
import "./NewAuxChannelView.css";
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

export default class NewChannelItemView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      mappings: this.props.auxMode.mappings
    };
    // if (props.mappings.range[0] === props.mappings.range[1]) {
    //   // handle multiple mappings
    //   props.mappings.range[1] += props.step;
    // }
  }
  // componentDidMount () {
  //   if (!this.state.mappings) {
  //     this.setState({ mappings: this.props.auxMode.mappings });
  //   }
  // }
  //run by bxf.js:
  //return sendCommand(device, `aux ${modeVals.split("|").join(" ")}`, 20);

  /*
  updateValue() {
    this.setState({ isDirty: true });
    FCConnector.setMode(this.state).then(() => {
      this.setState({ isDirty: false });
      this.props.notifyDirty(true, this.state);
    });
  }
  */

  // *** to save:
  // need to prepare a {} to give to FCConnector.setMode
  // then look at updateValue() above

  addRange() {
    var newmappings = this.state.mappings;
    newmappings.push({
      key: newmappings.length,
      id: this.props.auxMode.value, //***** need to find a way to leave this blank, and set it to an available ID on save */
      channel: 0,
      range: [900, 900]
    });
    this.setState({ mappings: newmappings.slice() });
    this.setState({ isDirty: true }); // also set info changed here
    this.props.notifyDirty(true, this.state);
  }

  deleteRange(i) {
    var newmappings = this.state.mappings;
    newmappings.splice(i, 1);
    this.setState({ mappings: newmappings.slice() });
    this.setState({ isDirty: true }); // also set info changed here
  }

  sliderChange = (index, value) => {
    //console.log(index, value);
    if (value[0] > value[1]) {
      [value[1], value[0]] = [value[0], value[1]]; //swap them, ensuring first number is the lower one
    }
    this.setState(previousState => {
      const mappings = [...previousState.mappings];
      mappings[index].range = value;
      return { mappings };
    });
  };

  render() {
    //set telemetry min and max
    // if (this.state.channel > -1 && this.props.telemetry) {
    //   sliderLeft =
    //     ((this.props.telemetry[this.state.channel] - this.props.telemetryMin) *
    //       100) /
    //     (this.props.telemetryMax - this.props.telemetryMin);
    // }

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
                <Chip
                  size="small"
                  color="primary"
                  label="Active"
                  style={{ marginLeft: "10px" }}
                />
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

            return (
              <AccordionDetails className="details" key={mapping.key}>
                <Grid container spacing={1}>
                  <Grid item xs>
                    <HelperSelect
                      id={this.props.id}
                      className={this.props.id}
                      label="Channel"
                      //value={//{this.props.auxMode.mappings..channel}
                      //items={}
                      onChange={event => {
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
                        position: "absolute",
                        left: `${sliderLeft}%`
                      }}
                      color="secondary"
                      fontSize="large"
                    />
                    <Slider
                      //value="0" //{value}
                      //onChange={handleChange}
                      valueLabelDisplay="auto"
                      aria-labelledby="range-slider"
                      value={[mapping.range[0], mapping.range[1]]}
                      min={this.props.min}
                      max={this.props.max}
                      marks
                      step={this.props.step}
                      //scaleLength={this.props.step}
                      //getAriaValueText={valuetext}

                      valueLabelDisplay="on"
                      onChange={(event, value) => this.sliderChange(i, value)}
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
                    {i == this.state.mappings.length - 1 && (
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
            this.state.mappings.length == 0 && (
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

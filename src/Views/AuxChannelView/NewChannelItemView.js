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

  addRange() {
    var newmappings = this.state.mappings;
    console.log("addRange");
    console.log(this.state.mappings);
    console.log(this.props.auxMode.value);
    newmappings.push({
      key: newmappings.length,
      id: this.props.auxMode.value, //set to auxmode ID
      channel: 0,
      range: [0, 0]
    });
    this.setState({ mappings: newmappings.slice() });
  }

  deleteRange(i) {
    var newmappings = this.state.mappings;
    newmappings.splice(i, 1);
    this.setState({ mappings: newmappings.slice() });
  }
  render() {
    //set telemetry min and max
    // if (this.state.channel > -1 && this.props.telemetry) {
    //   sliderLeft =
    //     ((this.props.telemetry[this.state.channel] - this.props.telemetryMin) *
    //       100) /
    //     (this.props.telemetryMax - this.props.telemetryMin);
    // }

    return (
      <Accordion>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel1c-content"
          id="panel1c-header"
        >
          <Grid container spacing={3}>
            <Grid item xs={9}>
              <Typography className="heading">
                <FormattedMessage id={this.props.auxMode.label} />
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
                      //onChange={event => this.props.changeProfile(event.target.value)}
                      //items={}
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
                      style={{
                        marginTop: 40
                      }}
                      value="0" //{value}
                      //onChange={handleChange}
                      valueLabelDisplay="auto"
                      aria-labelledby="range-slider"
                      value={mapping.range[0]}
                      min={this.props.min}
                      max={this.props.max}
                      //scaleLength={this.props.step}
                      //getAriaValueText={valuetext}
                    />
                  </Grid>
                  <Grid item xs>
                    <Typography style={{ margin: "20px" }}>
                      {this.props.max}
                    </Typography>
                  </Grid>
                  <Grid item xs>
                    <IconButton
                      aria-label="delete"
                      size="small"
                      style={{ marginTop: "20px" }}
                      onClick={() => this.deleteRange(i)}
                    >
                      <DeleteIcon style={{ fontSize: 18 }} />
                    </IconButton>
                    {i == this.state.mappings.length - 1 && (
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
              <IconButton
                aria-label="add"
                name="add_range"
                onClick={() => this.addRange()}
                color="primary"
                variant="contained"
              >
                <AddCircleOutlineIcon />
              </IconButton>
            )}
          <Button size="small">Reset</Button>
        </AccordionActions>
      </Accordion>
    );
  }
}

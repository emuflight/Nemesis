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

export default class NewChannelItemView extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return (
      <Accordion>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel1c-content"
          id="panel1c-header"
        >
          <div className="three-column">
            <Typography className="heading">
              <FormattedMessage id={this.props.auxMode.label} />
            </Typography>
          </div>
          <div className="three-column">
            {}
            <Typography className="secondaryHeading">
              <FormattedMessage id="aux.select.channel" />
            </Typography>
          </div>
        </AccordionSummary>
        <AccordionDetails className="details">
          <div style={{ width: "180rem" }}>
            <HelperSelect
              id={this.props.id}
              className={this.props.id}
              label="Channel"
              //value={//{this.props.auxMode.mappings..channel}
              //onChange={event => this.props.changeProfile(event.target.value)}
              //items={}
            />
            <Slider
              style={{
                width: 300,
                marginTop: 40,
                marginLeft: 20,
                width: "70%"
              }}
              value="0" //{value}
              //onChange={handleChange}
              valueLabelDisplay="auto"
              aria-labelledby="range-slider"
              //getAriaValueText={valuetext}
            />
          </div>
          <div className="helper">
            <Typography variant="caption">
              Explanation of flight mode
              <br />
              <a href="#secondary-heading-and-columns" className="link">
                Learn more
              </a>
            </Typography>
          </div>
        </AccordionDetails>
        <Divider />
        <AccordionActions>
          <Button size="small" color="red">
            Remove
          </Button>
          <Button size="small" color="red">
            Reset
          </Button>
        </AccordionActions>
      </Accordion>
    );
  }
}

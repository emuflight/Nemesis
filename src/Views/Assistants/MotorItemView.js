import React, { Component } from "react";
import Card from "@material-ui/core/Card";
import Button from "@material-ui/core/Button";
import CardActionArea from "@material-ui/core/CardActionArea";
import CardContent from "@material-ui/core/CardContent";
import CardActions from "@material-ui/core/CardActions";
import Typography from "@material-ui/core/Typography";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";

export default class MotorItemView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      motorIndex: props.motorIndex,
      remapping: false
    };
  }
  render() {
    return (
      <Card style={this.props.style}>
        <CardActionArea style={{ width: "100%" }}>
          <CardContent>
            <Typography gutterBottom variant="headline" component="h3">
              {this.props.label}
            </Typography>
            <Select
              value={this.state.motorIndex}
              onChange={event => {
                this.setState({ motorIndex: event.target.value });
                this.props.remapMotor(
                  event.target.value,
                  this.state.motorIndex
                );
              }}
            >
              <MenuItem value={1}>Motor 1</MenuItem>
              <MenuItem value={2}>Motor 2</MenuItem>
              <MenuItem value={3}>Motor 3</MenuItem>
              <MenuItem value={4}>Motor 4</MenuItem>
            </Select>
          </CardContent>
          <CardActions>
            <Button
              size="small"
              color="secondary"
              disabled={this.state.remapping}
              onMouseDown={() => this.props.spinTest(5)}
              onMouseUp={() => this.props.spinTest(0)}
            >
              Spin it
            </Button>
          </CardActions>
        </CardActionArea>
      </Card>
    );
  }
}

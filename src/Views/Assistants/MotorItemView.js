import React, { Component } from "react";
import Card from "@material-ui/core/Card";
import Button from "@material-ui/core/Button";
import CardActionArea from "@material-ui/core/CardActionArea";
import CardContent from "@material-ui/core/CardContent";
import CardActions from "@material-ui/core/CardActions";
import Typography from "@material-ui/core/Typography";
import { FormattedMessage } from "react-intl";

export default class MotorItemView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      motorIndex: props.motorIndex
    };
  }
  render() {
    return (
      <Card style={this.props.style}>
        <CardActionArea style={{ width: "100%" }}>
          <CardContent>
            <Typography gutterBottom variant="h5" component="h3">
              {this.props.label}
            </Typography>
          </CardContent>
          <CardActions>
            {this.props.spinning ? (
              <Button
                size="small"
                variant="raised"
                color="secondary"
                disabled={this.props.remapping}
                onClick={() => {
                  this.props.remapMotor(this.state.motorIndex);
                }}
              >
                <FormattedMessage id="motor.item.this-one" />
              </Button>
            ) : (
              <Button
                size="small"
                variant="raised"
                color="primary"
                disabled={this.props.remapping}
                onClick={() => this.props.spinTest(this.state.motorIndex)}
              >
                <FormattedMessage
                  id="motor.item.spin-motor"
                  values={{ index: this.state.motorIndex }}
                />
              </Button>
            )}
          </CardActions>
        </CardActionArea>
      </Card>
    );
  }
}

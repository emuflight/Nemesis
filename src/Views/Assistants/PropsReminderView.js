import React, { Component } from "react";
import Card from "@material-ui/core/Card";
import Button from "@material-ui/core/Button";
import CardActionArea from "@material-ui/core/CardActionArea";
import CardContent from "@material-ui/core/CardContent";
import CardActions from "@material-ui/core/CardActions";
import CardMedia from "@material-ui/core/CardMedia";
import Typography from "@material-ui/core/Typography";

export default class PropsReminderView extends Component {
  constructor(props) {
    super(props);
    let interval = setInterval(
      function() {
        this.setState({ secondsRemaining: this.state.secondsRemaining - 1 });
        if (this.state.secondsRemaining <= 0) {
          clearInterval(interval);
        }
      }.bind(this),
      1000
    );
  }
  state = {
    acceptedRisk: false,
    secondsRemaining: 6
  };

  render() {
    return (
      <div
        style={{
          width: 550,
          margin: "0 auto",
          display: "flex"
        }}
      >
        <Card style={{ flex: 1 }}>
          <CardActionArea style={{ width: "100%" }}>
            <CardMedia
              style={{ height: 300, backgroundSize: "contain" }}
              image="assets/teehee-safety.png"
              title="TEE-HEE"
            />
            <CardContent>
              <Typography variant="headline">
                Please remove the propellers from your quad before proceeding!
              </Typography>
              <Typography variant="headline">
                {this.state.secondsRemaining > 0
                  ? `You may proceed in ${
                      this.state.secondsRemaining
                    } seconds...`
                  : "Proceed with caution"}
              </Typography>
            </CardContent>
            <CardActions>
              <Button
                color="secondary"
                variant="raised"
                disabled={this.state.secondsRemaining > 0}
                onClick={() => this.props.acceptedRisk()}
              >
                I ACCEPT
              </Button>
            </CardActions>
          </CardActionArea>
        </Card>
      </div>
    );
  }
}

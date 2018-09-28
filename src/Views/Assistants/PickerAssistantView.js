import React, { Component } from "react";
import List from "@material-ui/core/List";
import Card from "@material-ui/core/Card";
import CardActionArea from "@material-ui/core/CardActionArea";
import CardMedia from "@material-ui/core/CardMedia";
import CardContent from "@material-ui/core/CardContent";
import Typography from "@material-ui/core/Typography";
import FCConnector from "../../utilities/FCConnector";

export default class PickerAssistantView extends Component {
  render() {
    return (
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          padding: 30
        }}
      >
        <Typography variant="headline">{`Select your ${
          this.props.title
        }`}</Typography>
        <List
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyItems: "center",
            alignContent: "center",
            justifyContent: "center"
          }}
        >
          {this.props.items &&
            this.props.items.map(type => {
              return (
                <Card style={{ flex: 1 }} key={type.title}>
                  <CardActionArea
                    style={{ width: "100%" }}
                    onClick={() => FCConnector.sendCommand(type.command)}
                  >
                    <CardMedia
                      style={{ height: 100 }}
                      image={type.image}
                      title={type.title}
                    />
                    <CardContent>
                      <Typography
                        gutterBottom
                        variant="headline"
                        component="h2"
                      >
                        {type.headline}
                      </Typography>
                    </CardContent>
                  </CardActionArea>
                </Card>
              );
            })}
        </List>
      </div>
    );
  }
}

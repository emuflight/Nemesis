import React, { Component } from "react";
import DropdownView from "../Items/DropdownView";
import SliderView from "../Items/SliderView";
import InputView from "../Items/InputView";
import Paper from "material-ui/Paper";

export default class ConfigListView extends Component {
  constructor(props) {
    super(props);
    this.notifyDirty = props.notifyDirty;
  }

  render() {
    return (
      <Paper
        zDepth={3}
        style={{
          margin: "10px",
          padding: "10px",
          display: "flex",
          flexWrap: "wrap"
        }}
      >
        {this.props.items &&
          this.props.items.map((item, i) => {
            switch (item.mode) {
              case "slider":
                return (
                  <SliderView
                    notifyDirty={this.notifyDirty}
                    key={i}
                    item={item}
                    inputVal={item.current}
                  />
                );
              // case "ARRAY":
              //   return (
              //     <ConfigListView
              //       notifyDirty={this.notifyDirty}
              //       key={i}
              //       items={item.values}
              //     />
              //   );
              case "LOOKUP":
                return (
                  <DropdownView
                    notifyDirty={this.notifyDirty}
                    key={i}
                    item={item}
                  />
                );
              default:
                return (
                  <InputView
                    notifyDirty={this.notifyDirty}
                    key={i}
                    item={item}
                  />
                );
            }
          })}
      </Paper>
    );
  }
}

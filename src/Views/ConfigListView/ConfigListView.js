import React, { Component } from "react";
import DropdownView from "../Items/DropdownView";
import SliderView from "../Items/SliderView";
import InputView from "../Items/InputView";

export default class ConfigListView extends Component {
  render() {
    return (
      <div
        style={{
          margin: "10px",
          padding: "10px",
          display: "flex",
          flexWrap: "wrap"
        }}
      >
        {this.props.items &&
          this.props.items.map(item => {
            switch (item.mode) {
              case "slider":
                return (
                  <SliderView
                    notifyDirty={this.props.notifyDirty}
                    key={item.id}
                    item={item}
                    inputVal={item.current}
                  />
                );
              // case "ARRAY":
              //   return (
              //     <ConfigListView
              //       notifyDirty={this.props.notifyDirty}
              //       key={i}
              //       items={item.values}
              //     />
              //   );
              case "LOOKUP":
                return (
                  <DropdownView
                    notifyDirty={this.props.notifyDirty}
                    key={item.id}
                    item={item}
                  />
                );
              default:
                return (
                  <InputView
                    notifyDirty={this.props.notifyDirty}
                    key={item.id}
                    item={item}
                  />
                );
            }
          })}
      </div>
    );
  }
}

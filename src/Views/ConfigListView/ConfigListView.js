import React, { Component } from "react";
import DropdownView from "../Items/DropdownView";
import SliderView from "../Items/SliderView";
import InputView from "../Items/InputView";
import { List } from "material-ui/List";

export default class ConfigListView extends Component {
  constructor(props) {
    super(props);
    this.notifyDirty = props.notifyDirty;
  }

  render() {
    return (
      <List>
        {this.props.items &&
          this.props.items.map(item => {
            let type = (item.element && item.element.type) || item.mode;
            switch (type) {
              case "slider":
                return (
                  <SliderView
                    notifyDirty={this.notifyDirty}
                    key={item.id}
                    item={item}
                    inputVal={item.current}
                  />
                );
              case "ARRAY":
                return (
                  <ConfigListView
                    notifyDirty={this.notifyDirty}
                    key={item.id}
                    items={item.values}
                  />
                );
              case "LOOKUP":
                return (
                  <DropdownView
                    notifyDirty={this.notifyDirty}
                    key={item.id}
                    item={item}
                  />
                );
              default:
                return (
                  <InputView
                    notifyDirty={this.notifyDirty}
                    key={item.id}
                    item={item}
                  />
                );
            }
          })}
      </List>
    );
  }
}

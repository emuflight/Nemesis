import React, { Component } from "react";
import DropdownView from "./Items/DropdownView";
import PidDenomView from "./PidDenomView/PidDenomView";
import SliderView from "./Items/SliderView";
import InputView from "./Items/InputView";
import { List } from "material-ui/List";

export default class ConfigListView extends Component {
  constructor(props) {
    super(props);
    this.items = props.items;
    this.notifyDirty = props.notifyDirty;
  }

  shouldComponentUpdate(nextState) {
    this.items = nextState.items;
    return true;
  }

  render() {
    console.log(this.items);
    return (
      <List>
        {this.items &&
          this.items.map(item => {
            let type = (item.element && item.element.type) || item.mode;
            switch (type) {
              case "PidDenomView":
                return (
                  <PidDenomView
                    notifyDirty={this.notifyDirty}
                    key={item.id}
                    item={item}
                  />
                );
              case "slider":
                return (
                  <SliderView
                    notifyDirty={this.notifyDirty}
                    key={item.id}
                    item={item}
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

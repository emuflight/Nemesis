import React, { Component } from "react";
import DropdownView from "./Items/DropdownView";
import InputView from "./Items/InputView";
import { List } from "material-ui/List";

export default class ConfigListView extends Component {
  constructor(props) {
    super(props);
    this.items = props.items;
  }

  shouldComponentUpdate(nextState) {
    this.items = nextState.items;
    return true;
  }

  render() {
    return (
      <List>
        {this.items &&
          this.items.map(item => {
            switch (item.mode) {
              case "ARRAY":
                return <ConfigListView items={item.values} />;
              case "LOOKUP":
                return <DropdownView key={item.id} item={item} />;
              default:
                return <InputView key={item.id} item={item} />;
            }
          })}
      </List>
    );
  }
}

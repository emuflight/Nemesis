import React from "react";
import DropdownView from "./Items/DropdownView";
import InputView from "./Items/InputView";
import {List} from "material-ui/List";

export default class ConfigListView extends React.Component {
  constructor(props) {
    super(props);
    this.items = props.items;
  }
  
  render() {
    return (
      <List>
      {this.items && this.items.map(item => {
        switch(item.mode) {
          case "ARRAY":
            break;
            // return <ConfigListView items={item}></ConfigListView>;
          case "LOOKUP":
            return <DropdownView key={item.id} item={item}></DropdownView>
          default:
            return <InputView key={item.id} item={item}></InputView>;
        }
        return <span key={Math.random()}></span>;
      })}
      
      </List>
    );
  }
}



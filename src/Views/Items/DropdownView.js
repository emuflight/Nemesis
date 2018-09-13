import React from "react";
import DropDownMenu from 'material-ui/DropDownMenu';
import MenuItem from 'material-ui/MenuItem';


export default class DropdownView extends React.Component {
  constructor(props) {
    super(props);
    this.state = props.item;
  }
  render(){
    return (
      <DropDownMenu 
      key={this.state.id}
      value={this.state.current}
              onChange={(itemValue) => this.setState({new: itemValue})}>
              {
                this.state.values && this.state.values.map(item => { 
                  return <MenuItem key={item} primaryText={item} value={item}></MenuItem>;
                })
              }
      </DropDownMenu>
    );
  }
};
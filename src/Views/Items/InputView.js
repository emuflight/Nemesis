import React from "react";
import TextField from 'material-ui/TextField'
import {ListItem} from 'material-ui/List'


export default class InputView extends ListItem {
  constructor(props) {
    super(props);
    this.state = props.item;
    
  }

  sanitizeInput = value => {
    if (value > this.props.max) {
      this.setState({new: this.props.max});
    } else if (value < this.props.min) {
      this.setState({new: this.props.min});
    } else {
      this.setState({new: value});
    }
  };

  render() {
    return (
      <div>
      <TextField
        key={this.state.id}
        hintText={this.state.id}
        defaultValue={this.state.current}
        onChange={text => this.setState({ current: text })}
        type="number"
      />
      </div>
    );
  }
}

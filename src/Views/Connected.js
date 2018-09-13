import React, {Component} from "react";
import AppBar from 'material-ui/AppBar';
import Drawer from 'material-ui/Drawer';
import MenuItem from 'material-ui/MenuItem';
import dynamicRoute from "./DynamicRoute";

export default class Connected extends Component {
  constructor(props) {
    super(props);
    this.fcConfig = props.fcConfig;
    this.uiConfig = props.uiConfig;

    this.routes = props.uiConfig.routes.map(route => {
      return { 
        key: route, 
        title: route,
        items: Object.keys(props.fcConfig).filter(key=> {
          return props.uiConfig.groups[route].indexOf(key) !== -1
        }).map(k=> {
          return Object.assign({id: k}, props.fcConfig[k]); 
        })
      }
    });
    this.state = {
      drawerOpen: false,
      currentRoute: this.routes[0],
    };
  }

  handleDrawerToggle = ()=> {
    this.setState({drawerOpen: !this.state.drawerOpen});
  }
  handleMenuItemClick = (event)=> {
    let newRoute = this.routes.find((route)=> route.key === event.currentTarget.id);
    this.setState({
      drawerOpen: false,
      currentRoute: newRoute
    });
  }
 
  render() {
    return (
      <div>
      <AppBar title={this.state.currentRoute.title}
      onLeftIconButtonClick={this.handleDrawerToggle}/>
      <Drawer open={this.state.drawerOpen}>
        {this.routes.map((route)=>{
          return <MenuItem
           id={route.key}
           key={route.key}
           onClick={this.handleMenuItemClick}>{route.title}</MenuItem>
        })}
      </Drawer>
      {dynamicRoute(this.state.currentRoute.items)}
      </div>
    );
  }
}
import React, {Component} from 'react';
import darkBaseTheme from 'material-ui/styles/baseThemes/lightBaseTheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';

import Connected from "./Views/Connected";
// import Disconnected from "./Views/Disconnected";
import FCConnector from "./utilities/FCConnector";
import fcConfig  from "./test/test_config.json";
import uiConfig  from "./test/ui_config.json";
const electron = window.require("electron") // little trick to import electron in react
const ipcRenderer = electron.ipcRenderer


class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
          updateReady:false
        }
        ipcRenderer.on('updateReady', (event, text) => {
            this.setState({updateReady:true})
        });
    }
    tryConnect(){
        FCConnector.detect().then((instance)=>{
          this.usbInstance = instance;
          this.uiMessage = 'Connected!';
        }).catch((error)=> {
          this.usbInstance = null;
          this.uiMessage = error;
        });
      }
      componentDidMount() {
        this.tryConnect();
      }

    render() {
        // if (this.usbInstance) {
            return(
            <MuiThemeProvider muiTheme={getMuiTheme(darkBaseTheme)}>
                <Connected connectinId={this.connectionId} uiConfig={uiConfig}  fcConfig={fcConfig} />
            </MuiThemeProvider>
            );
        //   } else {
        //     console.warn(this.uiMessage);
        //     setTimeout(()=>{
        //       this.tryConnect();
        //     }, 1000);
        //     return(
        //     <MuiThemeProvider  muiTheme={getMuiTheme(darkBaseTheme)}>
        //         <Disconnected message={this.uiMessage}/>
        //     </MuiThemeProvider>
        //     );
        //   }
    }
}

export default App;

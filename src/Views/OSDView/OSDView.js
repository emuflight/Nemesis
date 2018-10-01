import React, { Component } from "react";
import GridLayout from "react-grid-layout";
import "./OSDView.css";
import Paper from "@material-ui/core/Paper";
import List from "@material-ui/core/List";
import Switch from "@material-ui/core/Switch";
import theme from "../../Themes/Dark";
import FormGroup from "@material-ui/core/FormGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Typography from "@material-ui/core/Typography";
import ConfigListView from "../ConfigListView/ConfigListView";
import FCConnector from "../../utilities/FCConnector";

const visibilityFlag = 0x0800;

const checkOSDVal = val => {
  //TODO: this is wrong because the stupid timer flags use other bits and show up as checked even when they aren't
  let intVal = parseInt(val, 10) & visibilityFlag;
  // console.log((intVal >>> 0).toString(2));
  console.log((intVal >>> 0).toString(2));
  let isChecked = intVal > 0;
  return isChecked;
};
const xyPosToOSD = (x, y) =>
  ((x & ((1 << 5) - 1)) | ((y & ((1 << 5) - 1)) << 5)) ^ visibilityFlag;
const osdPosToXy = osdVal => {
  let pos = osdVal | visibilityFlag;
  let x = pos & 0x1f;
  let y = (pos >> 5) & ((1 << 5) - 1);
  return { x, y };
};

export default class OSDView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      elementsAvailable: props.items.filter(item => {
        return item.id.startsWith("osd_") && item.mode === "DIRECT";
      })
    };
  }
  setOSDElement(gridElement) {
    let newPos = xyPosToOSD(gridElement.x, gridElement.y);
    FCConnector.setValue(gridElement.i, newPos).then(() => {
      this.props.notifyDirty(true, gridElement, newPos);
    });
  }

  render() {
    let elementsPositioned = this.state.elementsAvailable.filter(item =>
      checkOSDVal(item.current)
    );
    let nonElementSettings = this.props.items.filter(item => {
      return item.mode !== "DIRECT";
    });
    return (
      <Paper
        theme={theme}
        elevation={3}
        style={{ margin: "0 auto", padding: "10px", display: "flex" }}
      >
        <div>
          <div
            style={{
              margin: "10px",
              padding: "10px",
              flex: 1,
              position: "relative"
            }}
          >
            {this.state.showDropZone && (
              <div className="dropzone-overlay">
                <Typography variant="headline">DROP ELEMENTS HERE</Typography>
              </div>
            )}
            <Paper
              theme={theme}
              elevation={3}
              style={{ margin: "10px", padding: "10px" }}
            >
              <GridLayout
                style={{
                  backgroundImage: "url('assets/osd-backdrop.png')",
                  backgroundPosition: "center",
                  backgroundRepeat: "none",
                  backgroundSize: "cover",
                  margin: "0 auto",
                  height: 340,
                  width: 550,
                  overflow: "hidden"
                }}
                width={550}
                onDragStop={(layout, oldItem, newItem) => {
                  this.setOSDElement(newItem);
                }}
                maxRows={13}
                autoSize={false}
                cols={30}
                compactType={null}
                preventCollision={false}
                rowHeight={16}
              >
                {elementsPositioned.map(item => {
                  let gridPos = osdPosToXy(parseInt(item.current, 10));
                  return (
                    <div
                      className="osd-element"
                      key={item.id}
                      data-grid={{
                        i: item.id,
                        x: gridPos.x,
                        y: gridPos.y,
                        w: 1,
                        h: 1,
                        isResizable: false
                      }}
                    >
                      {item.id}
                    </div>
                  );
                })}
              </GridLayout>
            </Paper>
            <div>
              <ConfigListView
                notifyDirty={this.props.notifyDirty}
                items={nonElementSettings}
              />
            </div>
          </div>
        </div>
        <Paper
          theme={theme}
          elevation={3}
          style={{
            margin: "10px",
            padding: "10px",
            height: 700,
            overflow: "auto"
          }}
        >
          <List style={{ overflow: "auto" }}>
            {this.state.elementsAvailable.map(item => {
              return (
                <FormGroup key={item.id} component="fieldset">
                  <FormControlLabel
                    control={
                      <Switch
                        id={item.id}
                        checked={checkOSDVal(item.current)}
                        onChange={() => {
                          item.current =
                            parseInt(item.current, 10) ^ visibilityFlag;
                          this.forceUpdate();
                        }}
                      />
                    }
                    label={item.id}
                  />
                </FormGroup>
              );
            })}
          </List>
        </Paper>
      </Paper>
    );
  }
}

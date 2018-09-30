import React, { Component } from "react";
import DropdownView from "../Items/DropdownView";
import SliderView from "../Items/SliderView";
import InputView from "../Items/InputView";
import Paper from "@material-ui/core/Paper";
import theme from "../../Themes/Dark";

export default class ConfigListView extends Component {
  render() {
    let inputs =
      (this.props.items &&
        this.props.items.filter(item => item.mode === "DIRECT")) ||
      [];
    let dropdowns =
      (this.props.items &&
        this.props.items.filter(item => item.mode === "LOOKUP")) ||
      [];
    let sliders =
      (this.props.items &&
        this.props.items.filter(item => item.mode === "slider")) ||
      [];
    return (
      <div
        className="config-list-view"
        style={{
          margin: "10px",
          padding: "10px"
        }}
      >
        {!!sliders.length && (
          <Paper
            theme={theme}
            elevation={3}
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(9, 1fr)",
              margin: "10px",
              padding: "10px"
            }}
          >
            {sliders.map(item => {
              return (
                <SliderView
                  className={item.id}
                  notifyDirty={this.props.notifyDirty}
                  key={item.id}
                  item={item}
                  inputVal={item.current}
                />
              );
            })}
          </Paper>
        )}
        {!!dropdowns.length && (
          <Paper
            theme={theme}
            elevation={3}
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              margin: "10px",
              padding: "10px"
            }}
          >
            {dropdowns.map(item => {
              return (
                <DropdownView
                  className={item.id}
                  notifyDirty={this.props.notifyDirty}
                  key={item.id}
                  item={item}
                />
              );
            })}
          </Paper>
        )}

        {!!inputs.length && (
          <Paper
            theme={theme}
            elevation={3}
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              margin: "10px",
              padding: "10px"
            }}
          >
            {inputs.map(item => {
              return (
                <InputView
                  className={item.id}
                  notifyDirty={this.props.notifyDirty}
                  key={item.id}
                  item={item}
                />
              );
            })}
          </Paper>
        )}
      </div>
    );
  }
}

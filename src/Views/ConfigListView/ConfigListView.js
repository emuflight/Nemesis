import React, { Component } from "react";
import DropdownView from "../Items/DropdownView";
import SliderView from "../Items/SliderView";
import InputView from "../Items/InputView";
import Paper from "@material-ui/core/Paper";
import FeaturesView from "../FeaturesView/FeaturesView";
import "./ConfigListView.css";

export default class ConfigListView extends Component {
  render() {
    let inputs =
      (this.props.items &&
        this.props.items.filter(item => item.mode === "DIRECT")) ||
      [];
    let dropdowns =
      (this.props.items &&
        this.props.items.filter(
          item => item.mode === "LOOKUP" || item.mode === "BITMASK"
        )) ||
      [];
    let sliders =
      (this.props.items &&
        this.props.items.filter(item => item.mode === "slider")) ||
      [];
    return (
      <div className="config-list-view">
        {this.props.features && (
          <FeaturesView
            fcConfig={this.props.fcConfig}
            features={this.props.features}
            notifyDirty={this.props.notifyDirty}
          />
        )}
        {!!sliders.length && (
          <Paper elevation={3} className="config-list-view-sliders">
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
          <Paper elevation={3} className="config-list-view-dropdowns">
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
          <Paper elevation={3} className="config-list-view-inputs">
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

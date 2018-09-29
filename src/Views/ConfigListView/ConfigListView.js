import React, { Component } from "react";
import DropdownView from "../Items/DropdownView";
import SliderView from "../Items/SliderView";
import InputView from "../Items/InputView";

export default class ConfigListView extends Component {
  render() {
    return (
      <div
        className="config-list-view"
        style={{
          margin: "10px",
          padding: "10px"
        }}
      >
        <div
          style={{
            display: "grid",
            marginBottom: 20,
            gridTemplateColumns: "repeat(9, 1fr)"
          }}
        >
          {this.props.items &&
            this.props.items
              .filter(item => item.mode === "slider")
              .map(item => {
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
        </div>
        <div
          style={{
            display: "grid",
            marginBottom: 20,
            gridTemplateColumns: "repeat(3, 1fr)"
          }}
        >
          {this.props.items &&
            this.props.items
              .filter(item => item.mode === "LOOKUP")
              .map(item => {
                return (
                  <DropdownView
                    className={item.id}
                    notifyDirty={this.props.notifyDirty}
                    key={item.id}
                    item={item}
                  />
                );
              })}
        </div>
        <div
          style={{
            display: "grid",
            marginBottom: 20,
            gridTemplateColumns: "repeat(3, 1fr)"
          }}
        >
          {this.props.items &&
            this.props.items
              .filter(item => item.mode === "DIRECT")
              .map(item => {
                return (
                  <InputView
                    className={item.id}
                    notifyDirty={this.props.notifyDirty}
                    key={item.id}
                    item={item}
                  />
                );
              })}
        </div>
      </div>
    );
  }
}

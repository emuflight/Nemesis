import React from "react";
// import ModesView from "./ModesView/ModesView";
import ConfigListView from "./ConfigListView/ConfigListView";
import FeaturesView from "./FeaturesView/FeaturesView";

const getRouteItems = (routeName, fcConfig, uiConfig) => {
  return Object.keys(fcConfig)
    .filter(key => {
      return (
        routeName === "ADVANCED" ||
        uiConfig.groups[routeName].indexOf(key) !== -1
      );
    })
    .map(k => {
      let itemObj = Object.assign(
        {
          id: k,
          element: uiConfig.elements[k]
        },
        fcConfig[k]
      );
      if (itemObj.element) {
        itemObj.step = itemObj.element.step || itemObj.step;
        itemObj.values = itemObj.element.values || itemObj.values;
        itemObj.axis = itemObj.element.axis;
      } else if (itemObj.values) {
        itemObj.values = itemObj.values.map(item => {
          return {
            value: item,
            label: item
          };
        });
      }
      return itemObj;
    });
};
export default (routeState, fcConfig, uiConfig, notifyDirty) => {
  switch (routeState.currentRoute.key) {
    case "MODES":
      return <div>XOMG MODESSSSSS</div>;
    case "FEATURES":
      return (
        <FeaturesView
          features={fcConfig.features.values}
          notifyDirty={notifyDirty}
        />
      );
    default:
      return (
        <ConfigListView
          notifyDirty={notifyDirty}
          items={getRouteItems(routeState.currentRoute.key, fcConfig, uiConfig)}
        />
      );
  }
};

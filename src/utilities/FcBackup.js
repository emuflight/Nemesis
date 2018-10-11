import FCConnector from "./FCConnector";

export default new class FcBackup {
  list() {
    let list = [];
    for (var i = 0, len = localStorage.length; i < len; ++i) {
      let key = localStorage.key(i);
      if (key.endsWith(".backup")) {
        list.push(key);
      }
    }
    return list;
  }

  backup(name, config) {
    return FCConnector.getTpaCurves(config.currentPidProfile).then(curves => {
      config.tpaCurves = curves;
      return FCConnector.getModes().then(modes => {
        config.modes = { values: modes };
        localStorage.setItem(`${name}.backup`, JSON.stringify(config));
      });
    });
  }

  restore() {
    //TODO: implement
  }

  load(name) {
    return JSON.parse(localStorage.getItem(name));
  }
}();

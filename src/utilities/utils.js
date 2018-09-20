const mapToLabel = k => {
  return {
    label: k,
    value: k
  };
};

const toSimpleConfigObj = (obj, key) => {
  return Object.assign({}, obj, {
    id: key,
    values: obj.values.map(mapToLabel)
  });
};

export { mapToLabel, toSimpleConfigObj };

export default (type, Fc, Fs) => {
  let Q = 1.0 / Math.sqrt(2.0);
  //"lowpass", 160, 32000, , 6
  var a0, a1, a2, b1, b2, norm;
  var ymin, ymax, minVal, maxVal;

  var K = Math.tan((Math.PI * Fc) / Fs);
  switch (type) {
    case "lowpass":
      norm = 1 / (1 + K / Q + K * K);
      a0 = K * K * norm;
      a1 = 2 * a0;
      a2 = a0;
      b1 = 2 * (K * K - 1) * norm;
      b2 = (1 - K / Q + K * K) * norm;
      break;
    case "notch":
      norm = 1 / (1 + K / Q + K * K);
      a0 = (1 + K * K) * norm;
      a1 = 2 * (K * K - 1) * norm;
      a2 = a0;
      b1 = a1;
      b2 = (1 - K / Q + K * K) * norm;
      break;
  }

  var len = 500;
  var magPlot = [];
  for (var idx = 0; idx < len; idx++) {
    var w = (idx / (len - 1)) * Math.PI; // 0 to pi, linear scale

    var phi = Math.pow(Math.sin(w / 2), 2);
    var y =
      Math.log(
        Math.pow(a0 + a1 + a2, 2) -
          4 * (a0 * a1 + 4 * a0 * a2 + a1 * a2) * phi +
          16 * a0 * a2 * phi * phi
      ) -
      Math.log(
        Math.pow(1 + b1 + b2, 2) -
          4 * (b1 + 4 * b2 + b1 * b2) * phi +
          16 * b2 * phi * phi
      );
    y = Math.max((y * 10) / Math.LN10, -120);

    magPlot.push({ x: idx, y });
    if (idx == 0) minVal = maxVal = y;
    else if (y < minVal) minVal = y;
    else if (y > maxVal) maxVal = y;
  }
  // configure y-axis
  ymin = -100;
  ymax = 0;
  if (maxVal > ymax) ymax = maxVal;

  return {
    plot: magPlot,
    axes: {
      y: { max: ymax, min: ymin }
    }
  };
};

module.exports = {

  ema: function (originalArray, emaLength) {

    let array = originalArray.slice().reverse();

    // trim initial NaN values
    let iPos = 0;
    for (iPos = 0; iPos < array.length && isNaN(array[iPos]); iPos++) {
    }
    array = array.slice(iPos);// trim initial NaN values from array
    if (array.length === 0) {
      // console.log("ma.EMA: Empty Array: Sometimes this occurs when the argued array is all zeroes, which is occasionally a mathematical possibility");
      return originalArray;
    }

    let ema = [];
    const k = 2 / (emaLength + 1);
    for (let i = 0; i < emaLength - 1; i++) {
      ema[i] = NaN;
    }

    ema[emaLength - 1] = array.slice(0, emaLength).reduce(function (a, b) {
      return parseFloat(a) + parseFloat(b);
    }) / emaLength;

    for (let i = emaLength; i < array.length; i++) {
      ema[i] = parseFloat(array[i]) * k + ema[i - 1] * (1 - k);
    }

    ema.reverse();// reverse back for main consumption
    for (let i = 0; i < iPos; i++) {
      ema.push(NaN);
    }
    for (let i = 0; i < ema.length; i++) {
      // console.log(ema[i])
      if (isNaN(ema[i])) {
        ema[i] = 0;
      }
    }
    return ema;
  },
}
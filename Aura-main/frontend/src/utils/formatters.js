// Indian Rupee (INR) Formatting Utility
export const formatINR = (amount, includeSymbol = true) => {
  const val = typeof amount === 'number' ? amount : parseFloat(amount) || 0;
  const isNegative = val < 0;
  const absFormatted = Math.abs(val).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  if (!includeSymbol) return isNegative ? `-${absFormatted}` : absFormatted;
  return isNegative ? `-₹${absFormatted}` : `₹${absFormatted}`;
};

export const formatINRShorthand = (amount) => {
  const val = typeof amount === 'number' ? amount : parseFloat(amount) || 0;
  const isNegative = val < 0;
  const absVal = Math.abs(val);
  let res;
  if (absVal >= 10000000) {
    res = `₹${(absVal / 10000000).toFixed(2)} Cr`;
  } else if (absVal >= 100000) {
    res = `₹${(absVal / 100000).toFixed(2)} L`;
  } else if (absVal >= 1000) {
    res = `₹${(absVal / 1000).toFixed(1)}k`;
  } else {
    res = `₹${absVal.toFixed(0)}`;
  }
  return isNegative ? `-${res}` : res;
};

export const numberToFixedString = (num: number): string => {
  return num.toFixed(2).replace(/\.00$/, "");
};

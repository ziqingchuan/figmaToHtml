import { numberToFixedString } from "./numToAutoFixed";

export const format = (
  property: string,
  value: number | string,
): string => {

  if (typeof value === "number") {
    return `${property}: ${numberToFixedString(value)}px`;
  }else {
    return `${property}: ${value}`;
  }
};

export const formatMultipleArray = (
  styles: Record<string, string | number>,
): string[] =>
  Object.entries(styles)
    .filter(([value]) => value !== "")
    .map(([key, value]) => format(key, value));

export const formatMultipleStyle = (
  styles: Record<string, string | number | null>,
): string =>
  Object.entries(styles)
    .filter(([_, value]) =>
      value !== null &&
      value !== '')
    .map(([key, value]) => format(key, value!))
    .join("; ");

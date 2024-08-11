import { type RGBColor } from "react-color";

export function toCssColor({ a, r, g, b }: RGBColor) {
  // Ensure r, g, b are within the valid range
  r = Math.max(0, Math.min(255, r));
  g = Math.max(0, Math.min(255, g));
  b = Math.max(0, Math.min(255, b));

  if (typeof a === "number") {
    // Ensure a is within the valid range
    a = Math.max(0, Math.min(1, a));
    return `rgba(${r}, ${g}, ${b}, ${a})`;
  } else {
    return `rgb(${r}, ${g}, ${b})`;
  }
}

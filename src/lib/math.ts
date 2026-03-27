import nerdamer from "nerdamer";
import "nerdamer/Calculus";

export function compileFunction(expr: string) {
  const f = (x: number) => {
    try {
      return nerdamer(expr, { x }).evaluate().text();
    } catch {
      return NaN;
    }
  };

  return (x: number) => Number(f(x));
}

export function derivative(expr: string) {
  try {
    const d = nerdamer.diff(expr, "x").toString();
    return d;
  } catch {
    return "";
  }
}
export type NewtonStep = {
  n: number;
  xn: number;
  fxn: number;
  dfxn: number;
  nextX: number;
};

export function nextNewtonStep(
  xn: number,
  f: (x: number) => number,
  df: (x: number) => number,
  n: number
): NewtonStep | null {
  const fxn = f(xn);
  const dfxn = df(xn);

  if (!isFinite(fxn) || !isFinite(dfxn) || dfxn === 0) {
    return null;
  }

  const nextX = xn - fxn / dfxn;

  return {
    n,
    xn,
    fxn,
    dfxn,
    nextX,
  };
}
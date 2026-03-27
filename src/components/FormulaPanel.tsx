import katex from "katex";

type Props = {
  expr: string;
  derivativeExpr: string;
  step?: {
    n: number;
    xn: number;
    fxn: number;
    dfxn: number;
    nextX: number;
  };
};

function fmt(n: number) {
  if (!Number.isFinite(n)) return "NaN";
  return n.toFixed(6);
}

function MathBlock({ math }: { math: string }) {
  const html = katex.renderToString(math, {
    throwOnError: false,
    displayMode: true,
  });

  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}

export default function FormulaPanel({ expr, derivativeExpr, step }: Props) {
  const functionMath = `f(x) = ${expr || "\\text{invalid}"}`;
  const derivativeMath = `f'(x) = ${derivativeExpr || "\\text{invalid}"}`;
  const generalNewtonMath = `x_{n+1} = x_n - \\frac{f(x_n)}{f'(x_n)}`;

  const substitutedMath = step
    ? `x_{${step.n + 1}} = ${fmt(step.xn)} - \\frac{${fmt(step.fxn)}}{${fmt(step.dfxn)}}`
    : "";

  const approxMath = step
    ? `x_{${step.n + 1}} \\approx ${fmt(step.nextX)}`
    : "";

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Newton&apos;s Method</h2>

      <div className="overflow-x-auto">
        <MathBlock math={functionMath} />
      </div>

      <div className="overflow-x-auto">
        <MathBlock math={derivativeMath} />
      </div>

      <div className="overflow-x-auto">
        <MathBlock math={generalNewtonMath} />
      </div>

      {step && (
        <>
          <div className="overflow-x-auto">
            <MathBlock math={substitutedMath} />
          </div>

          <div className="overflow-x-auto">
            <MathBlock math={approxMath} />
          </div>
        </>
      )}
    </div>
  );
}
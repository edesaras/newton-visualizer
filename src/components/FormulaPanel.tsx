import { BlockMath } from "react-katex";

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
  return Number.isFinite(n) ? n.toFixed(6) : "NaN";
}

export default function FormulaPanel({ expr, derivativeExpr, step }: Props) {
  return (
    <div className="rounded border p-4 space-y-4 bg-white">
      <h2 className="text-xl font-semibold">Newton&apos;s Method</h2>

      <BlockMath math={`f(x) = ${expr}`} />
      <BlockMath math={`f'(x) = ${derivativeExpr || "\\text{invalid}"}`} />
      <BlockMath math={`x_{n+1} = x_n - \\frac{f(x_n)}{f'(x_n)}`} />

      {step && (
        <>
          <BlockMath
            math={`x_{${step.n + 1}} = ${fmt(step.xn)} - \\frac{${fmt(step.fxn)}}{${fmt(step.dfxn)}}`}
          />
          <BlockMath
            math={`x_{${step.n + 1}} \\approx ${fmt(step.nextX)}`}
          />
        </>
      )}
    </div>
  );
}
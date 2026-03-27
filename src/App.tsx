import { useMemo, useState } from "react";
import Graph from "./components/Graph";
import FormulaPanel from "./components/FormulaPanel";
import CommentaryPanel from "./components/CommentaryPanel";
import ExamplesPanel from "./components/ExamplesPanel";
import { compileFunction, derivative } from "./lib/math";
import { nextNewtonStep, type NewtonStep } from "./lib/newton";
import type { Example } from "./lib/examples";
import { BlockMath } from "react-katex";

export default function App() {
  const [expr, setExpr] = useState("cos(x) - x");
  const [x0, setX0] = useState(-1);
  const [steps, setSteps] = useState<NewtonStep[]>([]);
  const [error, setError] = useState("");
  const [examplesOpen, setExamplesOpen] = useState(false);

  const dExpr = useMemo(() => {
    try {
      return derivative(expr);
    } catch {
      return "";
    }
  }, [expr]);

  const f = useMemo(() => {
    try {
      return compileFunction(expr);
    } catch {
      return () => NaN;
    }
  }, [expr]);

  const df = useMemo(() => {
    try {
      return compileFunction(dExpr);
    } catch {
      return () => NaN;
    }
  }, [dExpr]);

  const currentStep = steps.length > 0 ? steps[steps.length - 1] : undefined;
  const previousStep = steps.length > 1 ? steps[steps.length - 2] : undefined;

  function handleSelectExample(example: Example) {
    setExpr(example.expr);
    setX0(example.x0);
    setSteps([]);
    setError("");
    setExamplesOpen(false);
  }

  function handleNext() {
    setError("");

    const currentX = steps.length === 0 ? x0 : steps[steps.length - 1].nextX;
    const step = nextNewtonStep(currentX, f, df, steps.length);

    if (!step) {
      setError(
        "Could not compute the next Newton step. The derivative may be too small or the function may be invalid at this point."
      );
      return;
    }

    setSteps((prev) => [...prev, step]);
  }

  function handleReset() {
    setSteps([]);
    setError("");
  }

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <header className="mb-6 rounded-2xl border border-gray-200 bg-white px-6 py-5 shadow-sm">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-gray-500">
            Numerical Methods
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-gray-950 sm:text-4xl">
            Newton Visualizer
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-gray-600 sm:text-base">
            Explore Newton&apos;s method step by step. Enter a function, choose an
            initial guess, and see how each tangent line generates the next approximation.
          </p>
        </header>

        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Inputs</h2>
              <p className="mt-1 text-sm text-gray-600">
                Enter a function and an initial guess for Newton&apos;s method.
              </p>
            </div>

            <div className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
              {currentStep ? `Iteration ${currentStep.n}` : "No iteration yet"}
            </div>
          </div>

          <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px]">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                f(x)
              </label>
              <input
                value={expr}
                onChange={(e) => {
                  setExpr(e.target.value);
                  setSteps([]);
                  setError("");
                }}
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none transition focus:border-gray-900 focus:ring-2 focus:ring-gray-200"
                placeholder="(x - 2) * (x + 2) * (x + 1000)"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Initial guess x₀
              </label>
              <input
                type="number"
                value={x0}
                onChange={(e) => {
                  setX0(Number(e.target.value));
                  setSteps([]);
                  setError("");
                }}
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none transition focus:border-gray-900 focus:ring-2 focus:ring-gray-200"
              />
            </div>
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <div className="rounded-2xl border border-gray-200 bg-gradient-to-b from-gray-50 to-white px-4 py-4 shadow-sm">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-gray-500">
                  Function
                </p>
                <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-medium text-gray-500 ring-1 ring-gray-200">
                  Preview
                </span>
              </div>

              <div className="overflow-x-auto rounded-xl bg-white px-3 py-3 ring-1 ring-gray-200">
                <BlockMath math={`f(x) = ${expr || "\\text{invalid}"}`} />
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-gradient-to-b from-gray-50 to-white px-4 py-4 shadow-sm">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-gray-500">
                  Derivative
                </p>
                <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-medium text-gray-500 ring-1 ring-gray-200">
                  Auto-calculated
                </span>
              </div>

              <div className="overflow-x-auto rounded-xl bg-white px-3 py-3 ring-1 ring-gray-200">
                <BlockMath math={`f'(x) = ${dExpr || "\\text{invalid}"}`} />
              </div>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button
              onClick={handleNext}
              className="rounded-xl bg-gray-950 px-5 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-gray-800"
            >
              Next Step
            </button>

            <button
              onClick={handleReset}
              className="rounded-xl border border-gray-300 bg-white px-5 py-3 text-sm font-medium text-gray-800 transition hover:bg-gray-100"
            >
              Reset
            </button>

            <button
              onClick={() => setExamplesOpen((v) => !v)}
              className="rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-800 transition hover:bg-gray-100"
            >
              {examplesOpen ? "Hide Examples" : "Show Examples"}
            </button>
          </div>

          {error && (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {examplesOpen && (
            <div className="mt-4 rounded-2xl border border-gray-200 bg-gray-50 p-3">
              <ExamplesPanel onSelect={handleSelectExample} />
            </div>
          )}
        </section>

        <section className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.65fr)_minmax(340px,1fr)]">
          <div className="min-w-0 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Graph</h2>
              <p className="mt-1 text-sm text-gray-600">
                Watch the current tangent step and the next estimate.
              </p>
            </div>

            <Graph f={f} step={currentStep} />
            <FormulaPanel
              expr={expr}
              derivativeExpr={dExpr}
              step={currentStep}
            />
          </div>

          <div className="min-w-0 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
            <CommentaryPanel
              step={currentStep}
              previousStep={previousStep}
            />

          </div>
        </section>

        <section className="mt-6 grid gap-6 ">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Iteration History
              </h2>
              <p className="mt-1 text-sm text-gray-600">
                Numerical values produced at each step.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full border-separate border-spacing-0 overflow-hidden rounded-xl">
                <thead>
                  <tr>
                    <th className="border-b border-t border-gray-200 bg-gray-50 px-4 py-3 text-left text-sm font-semibold text-gray-700 first:rounded-tl-xl first:border-l last:rounded-tr-xl">
                      n
                    </th>
                    <th className="border-b border-t border-gray-200 bg-gray-50 px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      xₙ
                    </th>
                    <th className="border-b border-t border-gray-200 bg-gray-50 px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      f(xₙ)
                    </th>
                    <th className="border-b border-t border-gray-200 bg-gray-50 px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      f&apos;(xₙ)
                    </th>
                    <th className="border-b border-t border-gray-200 bg-gray-50 px-4 py-3 text-left text-sm font-semibold text-gray-700 last:rounded-tr-xl last:border-r">
                      xₙ₊₁
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {steps.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="rounded-b-xl border border-t-0 border-gray-200 px-4 py-8 text-center text-sm text-gray-500"
                      >
                        No iterations yet.
                      </td>
                    </tr>
                  ) : (
                    steps.map((step, index) => (
                      <tr key={step.n} className="bg-white">
                        <td
                          className={`border-b border-gray-200 px-4 py-3 text-sm text-gray-800 ${index === steps.length - 1 ? "font-semibold" : ""
                            }`}
                        >
                          {step.n}
                        </td>
                        <td className="border-b border-gray-200 px-4 py-3 font-mono text-sm text-gray-800">
                          {step.xn.toFixed(6)}
                        </td>
                        <td className="border-b border-gray-200 px-4 py-3 font-mono text-sm text-gray-800">
                          {step.fxn.toFixed(6)}
                        </td>
                        <td className="border-b border-gray-200 px-4 py-3 font-mono text-sm text-gray-800">
                          {step.dfxn.toFixed(6)}
                        </td>
                        <td className="border-b border-gray-200 px-4 py-3 font-mono text-sm text-gray-800">
                          {step.nextX.toFixed(6)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
type Step = {
  n: number;
  xn: number;
  fxn: number;
  dfxn: number;
  nextX: number;
};

type Props = {
  step?: Step;
  previousStep?: Step;
};

function fmt(n: number) {
  if (!Number.isFinite(n)) return "NaN";
  if (Math.abs(n) >= 1000 || (Math.abs(n) > 0 && Math.abs(n) < 0.001)) {
    return n.toExponential(3);
  }
  return n.toFixed(6);
}

export default function CommentaryPanel({ step, previousStep }: Props) {
  if (!step) {
    return (
      <section className="rounded border bg-white p-4">
        <h2 className="text-xl font-semibold">Commentary</h2>
        <p className="mt-3 text-sm text-gray-600">
          Start iterating to see an explanation of what Newton&apos;s method is doing at each step.
        </p>
      </section>
    );
  }

  const stepSize = Math.abs(step.nextX - step.xn);
  const absFx = Math.abs(step.fxn);
  const absSlope = Math.abs(step.dfxn);

  const observations: string[] = [];

  observations.push(
    `At iteration ${step.n}, the current estimate is xₙ = ${fmt(step.xn)}.`
  );

  if (step.fxn > 0) {
    observations.push(
      `Since f(xₙ) = ${fmt(step.fxn)} is positive, the current point lies above the x-axis.`
    );
  } else if (step.fxn < 0) {
    observations.push(
      `Since f(xₙ) = ${fmt(step.fxn)} is negative, the current point lies below the x-axis.`
    );
  } else {
    observations.push(
      `f(xₙ) is exactly zero, so the method has already reached a root.`
    );
  }

  if (absSlope < 0.2) {
    observations.push(
      `The derivative is small here: f'(xₙ) = ${fmt(step.dfxn)}. A small slope can make Newton's method unstable or produce large jumps.`
    );
  } else if (absSlope < 1) {
    observations.push(
      `The derivative is relatively gentle here: f'(xₙ) = ${fmt(step.dfxn)}.`
    );
  } else {
    observations.push(
      `The tangent has a reasonably strong slope here: f'(xₙ) = ${fmt(step.dfxn)}.`
    );
  }

  observations.push(
    `Using the tangent line, the next estimate becomes xₙ₊₁ = ${fmt(step.nextX)}.`
  );

  if (stepSize < 0.0001) {
    observations.push(
      `The update is extremely small, so the method appears to be very close to convergence.`
    );
  } else if (stepSize < 0.01) {
    observations.push(
      `The update is small, which suggests the iterations are settling down.`
    );
  } else if (stepSize > 2) {
    observations.push(
      `This step makes a large jump, which can be a sign of instability or sensitivity to the starting point.`
    );
  } else {
    observations.push(
      `The method makes a moderate correction in this step.`
    );
  }

  if (previousStep) {
    const prevAbsFx = Math.abs(previousStep.fxn);

    if (absFx < prevAbsFx) {
      observations.push(
        `Compared with the previous step, |f(xₙ)| has decreased, so the method is moving closer to a root.`
      );
    } else if (absFx > prevAbsFx) {
      observations.push(
        `Compared with the previous step, |f(xₙ)| has increased, so this iteration is not improving the approximation.`
      );
    } else {
      observations.push(
        `Compared with the previous step, |f(xₙ)| is about the same.`
      );
    }
  }

  return (
    <section className="rounded border bg-white p-4">
      <h2 className="text-xl font-semibold">Commentary</h2>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded bg-gray-50 p-3">
          <div className="text-xs uppercase tracking-wide text-gray-500">Current estimate</div>
          <div className="mt-1 font-mono text-sm">{fmt(step.xn)}</div>
        </div>

        <div className="rounded bg-gray-50 p-3">
          <div className="text-xs uppercase tracking-wide text-gray-500">Next estimate</div>
          <div className="mt-1 font-mono text-sm">{fmt(step.nextX)}</div>
        </div>

        <div className="rounded bg-gray-50 p-3">
          <div className="text-xs uppercase tracking-wide text-gray-500">Function value</div>
          <div className="mt-1 font-mono text-sm">{fmt(step.fxn)}</div>
        </div>

        <div className="rounded bg-gray-50 p-3">
          <div className="text-xs uppercase tracking-wide text-gray-500">Derivative</div>
          <div className="mt-1 font-mono text-sm">{fmt(step.dfxn)}</div>
        </div>
      </div>

      <div className="mt-4 space-y-3 text-sm leading-6 text-gray-700">
        {observations.map((text, index) => (
          <p key={index}>{text}</p>
        ))}
      </div>
    </section>
  );
}
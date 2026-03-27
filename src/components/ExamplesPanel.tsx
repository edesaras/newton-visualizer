import { EXAMPLES, type Example } from "../lib/examples";

type Props = {
  onSelect: (example: Example) => void;
};

function behaviorClasses(behavior: Example["behavior"]) {
  switch (behavior) {
    case "fast":
      return "bg-green-100 text-green-800 border-green-200";
    case "slow":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "unstable":
      return "bg-orange-100 text-orange-800 border-orange-200";
    case "fail":
      return "bg-red-100 text-red-800 border-red-200";
  }
}

function behaviorLabel(behavior: Example["behavior"]) {
  switch (behavior) {
    case "fast":
      return "Converges fast";
    case "slow":
      return "Converges slowly";
    case "unstable":
      return "Unstable";
    case "fail":
      return "Can fail";
  }
}

export default function ExamplesPanel({ onSelect }: Props) {
  return (
    <section className="mt-6 rounded border bg-white p-4">
      <div className="mb-4">
        <h2 className="text-xl font-semibold">Examples</h2>
        <p className="mt-1 text-sm text-gray-600">
          Load a built-in function to explore different Newton behaviors.
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {EXAMPLES.map((example) => (
          <button
            key={example.id}
            type="button"
            onClick={() => onSelect(example)}
            className="rounded border p-4 text-left transition hover:border-black hover:shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <h3 className="font-semibold">{example.title}</h3>
              <span
                className={`rounded border px-2 py-1 text-xs font-medium ${behaviorClasses(example.behavior)}`}
              >
                {behaviorLabel(example.behavior)}
              </span>
            </div>

            <p className="mt-3 font-mono text-sm text-gray-800">
              f(x) = {example.expr}
            </p>
            <p className="mt-1 text-sm text-gray-700">x₀ = {example.x0}</p>
            <p className="mt-3 text-sm text-gray-600">{example.description}</p>
          </button>
        ))}
      </div>
    </section>
  );
}
export type ExampleBehavior = "fast" | "slow" | "unstable" | "fail";

export type Example = {
  id: string;
  title: string;
  expr: string;
  x0: number;
  description: string;
  behavior: ExampleBehavior;
};

export const EXAMPLES: Example[] = [
  {
    id: "sqrt2",
    title: "Square root of 2",
    expr: "x^2 - 2",
    x0: 1,
    description: "A classic example. Newton's method converges quickly to √2.",
    behavior: "fast",
  },
  {
    id: "cubic-standard",
    title: "Standard cubic",
    expr: "x^3 - x - 2",
    x0: 1.5,
    description: "A smooth example with clear geometric steps and fast convergence.",
    behavior: "fast",
  },
  {
    id: "cosx",
    title: "cos(x) - x",
    expr: "cos(x) - x",
    x0: 1,
    description: "A well-known non-polynomial example with stable convergence.",
    behavior: "fast",
  },
  {
    id: "flat-cubic",
    title: "Flat near the root",
    expr: "x^3",
    x0: 0.1,
    description: "The derivative becomes small near the root, so convergence is slower.",
    behavior: "slow",
  },
  {
    id: "jumping-cubic",
    title: "Large jumps",
    expr: "x^3 - 2*x + 2",
    x0: 0,
    description: "This one can jump around and is useful for showing unstable behavior.",
    behavior: "unstable",
  },
  {
    id: "derivative-problem",
    title: "Derivative trouble",
    expr: "x^(1/3)",
    x0: 0.1,
    description: "A difficult case near zero where Newton's method behaves poorly.",
    behavior: "fail",
  },
];
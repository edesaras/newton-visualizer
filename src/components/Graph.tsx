import { useEffect, useMemo, useRef, useState } from "react";

type Step = {
    xn: number;
    fxn: number;
    dfxn: number;
    nextX: number;
    n: number
};

type Props = {
    f: (x: number) => number;
    step?: Step;
};

type Viewport = {
    xMin: number;
    xMax: number;
    yMin: number;
    yMax: number;
};

function isFiniteVisible(y: number) {
    return Number.isFinite(y) && Math.abs(y) < 1e6;
}

function lerp(a: number, b: number, t: number) {
    return a + (b - a) * t;
}

function easeOutCubic(t: number) {
    return 1 - Math.pow(1 - t, 3);
}

function formatShort(n: number) {
    if (!Number.isFinite(n)) return "NaN";
    if (Math.abs(n) >= 1000 || (Math.abs(n) > 0 && Math.abs(n) < 0.001)) {
        return n.toExponential(2);
    }
    return n.toFixed(3);
}

function computeTargetViewport(f: (x: number) => number, step?: Step): Viewport {
    const focusCenter = step ? (step.xn + step.nextX) / 2 : 0;
    const localDx = step ? Math.abs(step.nextX - step.xn) : 0;

    const halfSpanX = Math.max(0.6, localDx * 1.8, step ? Math.abs(step.xn) * 0.12 : 1);
    const xMin = focusCenter - halfSpanX;
    const xMax = focusCenter + halfSpanX;

    const ys: number[] = [0];
    const sampleCount = 320;

    for (let i = 0; i <= sampleCount; i++) {
        const x = xMin + (i / sampleCount) * (xMax - xMin);
        const y = f(x);
        if (isFiniteVisible(y)) ys.push(y);
    }

    if (step && isFiniteVisible(step.fxn)) {
        ys.push(step.fxn);
    }

    const rawMinY = Math.min(...ys);
    const rawMaxY = Math.max(...ys);
    const spanY = Math.max(1, rawMaxY - rawMinY);
    const centerY = (rawMinY + rawMaxY) / 2;

    return {
        xMin,
        xMax,
        yMin: centerY - spanY * 0.7,
        yMax: centerY + spanY * 0.7,
    };
}

export default function Graph({ f, step }: Props) {
    const width = 860;
    const height = 520;
    const padding = 56;

    const initialViewport = useMemo(() => computeTargetViewport(f, step), [f, step]);
    const [view, setView] = useState<Viewport>(initialViewport);
    const [followStep, setFollowStep] = useState(true);

    const targetView = useMemo(() => computeTargetViewport(f, step), [f, step]);

    useEffect(() => {
        if (!followStep) return;

        let frame = 0;
        let start: number | null = null;
        const from = view;
        const to = targetView;
        const duration = 450;

        function animate(ts: number) {
            if (start === null) start = ts;
            const t = Math.min(1, (ts - start) / duration);
            const eased = easeOutCubic(t);

            setView({
                xMin: lerp(from.xMin, to.xMin, eased),
                xMax: lerp(from.xMax, to.xMax, eased),
                yMin: lerp(from.yMin, to.yMin, eased),
                yMax: lerp(from.yMax, to.yMax, eased),
            });

            if (t < 1) {
                frame = requestAnimationFrame(animate);
            }
        }

        frame = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(frame);
    }, [targetView, followStep]);

    const draggingRef = useRef(false);
    const lastPointerRef = useRef<{ x: number; y: number } | null>(null);
    const wheelContainerRef = useRef<HTMLDivElement | null>(null);

    const innerWidth = width - padding * 2;
    const innerHeight = height - padding * 2;

    const scaleX = (x: number) =>
        padding + ((x - view.xMin) / (view.xMax - view.xMin)) * innerWidth;

    const scaleY = (y: number) =>
        padding + innerHeight - ((y - view.yMin) / (view.yMax - view.yMin)) * innerHeight;

    const unscaleDx = (dxPixels: number) => (dxPixels / innerWidth) * (view.xMax - view.xMin);
    const unscaleDy = (dyPixels: number) => (dyPixels / innerHeight) * (view.yMax - view.yMin);

    const samples: { x: number; y: number }[] = [];
    const sampleCount = 700;

    for (let i = 0; i <= sampleCount; i++) {
        const x = view.xMin + (i / sampleCount) * (view.xMax - view.xMin);
        const y = f(x);
        if (isFiniteVisible(y)) {
            samples.push({ x, y });
        }
    }

    const polylinePoints = samples
        .map((p) => `${scaleX(p.x)},${scaleY(p.y)}`)
        .join(" ");

    const xAxisY = scaleY(0);
    const yAxisX = scaleX(0);

    const tickCount = 6;
    const xTicks = Array.from(
        { length: tickCount + 1 },
        (_, i) => view.xMin + (i / tickCount) * (view.xMax - view.xMin)
    );
    const yTicks = Array.from(
        { length: tickCount + 1 },
        (_, i) => view.yMin + (i / tickCount) * (view.yMax - view.yMin)
    );

    function zoomAroundCenter(factor: number) {
        setFollowStep(false);
        setView((v) => {
            const cx = (v.xMin + v.xMax) / 2;
            const cy = (v.yMin + v.yMax) / 2;
            const halfX = ((v.xMax - v.xMin) * factor) / 2;
            const halfY = ((v.yMax - v.yMin) * factor) / 2;

            return {
                xMin: cx - halfX,
                xMax: cx + halfX,
                yMin: cy - halfY,
                yMax: cy + halfY,
            };
        });
    }

    function recenter() {
        setFollowStep(true);
        setView(targetView);
    }

    useEffect(() => {
        const el = wheelContainerRef.current;
        if (!el) return;

        const handleWheel = (e: WheelEvent) => {
            e.preventDefault();
            zoomAroundCenter(e.deltaY < 0 ? 0.9 : 1.1);
        };

        el.addEventListener("wheel", handleWheel, { passive: false });

        return () => {
            el.removeEventListener("wheel", handleWheel);
        };
    }, []);

    return (
        <div className="mt-6 rounded border bg-white p-3">
            <div className="mb-3 flex flex-wrap gap-2">
                <button className="rounded border px-3 py-1" onClick={() => zoomAroundCenter(0.8)}>
                    Zoom In
                </button>
                <button className="rounded border px-3 py-1" onClick={() => zoomAroundCenter(1.25)}>
                    Zoom Out
                </button>
                <button className="rounded border px-3 py-1" onClick={recenter}>
                    Recenter
                </button>
                <button
                    className={`rounded border px-3 py-1 ${followStep ? "bg-black text-white" : ""}`}
                    onClick={() => setFollowStep((v) => !v)}
                >
                    Follow Step
                </button>
            </div>

            <div
                ref={wheelContainerRef}
                className="overflow-hidden"
                style={{ overscrollBehavior: "contain" }}
            >
                <svg
                    viewBox={`0 0 ${width} ${height}`}
                    className="block h-auto w-full cursor-grab active:cursor-grabbing"
                    role="img"
                    aria-label="Newton method graph"
                    onMouseDown={(e) => {
                        draggingRef.current = true;
                        lastPointerRef.current = { x: e.clientX, y: e.clientY };
                        setFollowStep(false);
                    }}
                    onMouseMove={(e) => {
                        if (!draggingRef.current || !lastPointerRef.current) return;

                        const dx = e.clientX - lastPointerRef.current.x;
                        const dy = e.clientY - lastPointerRef.current.y;
                        lastPointerRef.current = { x: e.clientX, y: e.clientY };

                        setView((v) => ({
                            xMin: v.xMin - unscaleDx(dx),
                            xMax: v.xMax - unscaleDx(dx),
                            yMin: v.yMin + unscaleDy(dy),
                            yMax: v.yMax + unscaleDy(dy),
                        }));
                    }}
                    onMouseUp={() => {
                        draggingRef.current = false;
                        lastPointerRef.current = null;
                    }}
                    onMouseLeave={() => {
                        draggingRef.current = false;
                        lastPointerRef.current = null;
                    }}
                >
                    <rect x={0} y={0} width={width} height={height} fill="white" />

                    {xTicks.map((tick, i) => (
                        <g key={`x-grid-${i}`}>
                            <line
                                x1={scaleX(tick)}
                                y1={padding}
                                x2={scaleX(tick)}
                                y2={height - padding}
                                stroke="#e5e7eb"
                                strokeWidth={1}
                            />
                            <text
                                x={scaleX(tick)}
                                y={height - padding + 20}
                                textAnchor="middle"
                                fontSize="12"
                                fill="#6b7280"
                            >
                                {formatShort(tick)}
                            </text>
                        </g>
                    ))}

                    {yTicks.map((tick, i) => (
                        <g key={`y-grid-${i}`}>
                            <line
                                x1={padding}
                                y1={scaleY(tick)}
                                x2={width - padding}
                                y2={scaleY(tick)}
                                stroke="#e5e7eb"
                                strokeWidth={1}
                            />
                            <text
                                x={padding - 10}
                                y={scaleY(tick) + 4}
                                textAnchor="end"
                                fontSize="12"
                                fill="#6b7280"
                            >
                                {formatShort(tick)}
                            </text>
                        </g>
                    ))}

                    <line
                        x1={padding}
                        y1={xAxisY}
                        x2={width - padding}
                        y2={xAxisY}
                        stroke="#6b7280"
                        strokeWidth={1.5}
                    />

                    <line
                        x1={yAxisX}
                        y1={padding}
                        x2={yAxisX}
                        y2={height - padding}
                        stroke="#6b7280"
                        strokeWidth={1.5}
                    />

                    <polyline
                        fill="none"
                        stroke="#111827"
                        strokeWidth={2.5}
                        points={polylinePoints}
                        strokeLinejoin="round"
                        strokeLinecap="round"
                    />

                    {step && (
                        <>
                            <line
                                x1={scaleX(step.xn)}
                                y1={scaleY(0)}
                                x2={scaleX(step.xn)}
                                y2={scaleY(step.fxn)}
                                stroke="#9ca3af"
                                strokeWidth={1.5}
                                strokeDasharray="6 6"
                            />

                            {(() => {
                                const m = step.dfxn;
                                const b = step.fxn - m * step.xn;
                                const tx1 = view.xMin;
                                const tx2 = view.xMax;
                                const ty1 = m * tx1 + b;
                                const ty2 = m * tx2 + b;

                                return (
                                    <line
                                        x1={scaleX(tx1)}
                                        y1={scaleY(ty1)}
                                        x2={scaleX(tx2)}
                                        y2={scaleY(ty2)}
                                        stroke="#2563eb"
                                        strokeWidth={3}
                                        strokeLinecap="round"
                                    />
                                );
                            })()}

                            <line
                                x1={scaleX(step.xn)}
                                y1={scaleY(step.fxn)}
                                x2={scaleX(step.nextX)}
                                y2={scaleY(0)}
                                stroke="#10b981"
                                strokeWidth={2}
                                strokeDasharray="7 5"
                            />

                            <circle cx={scaleX(step.xn)} cy={scaleY(0)} r={5} fill="#7c3aed" />
                            <circle cx={scaleX(step.xn)} cy={scaleY(step.fxn)} r={8} fill="#dc2626" />
                            <circle cx={scaleX(step.nextX)} cy={scaleY(0)} r={7} fill="#059669" />

                            <text
                                x={scaleX(step.xn)}
                                y={scaleY(0) + 24}
                                textAnchor="middle"
                                fontSize="13"
                                fontWeight="600"
                                fill="#5b21b6"
                            >
                                x{step.n}
                            </text>

                            <text
                                x={scaleX(step.nextX)}
                                y={scaleY(0) + 24}
                                textAnchor="middle"
                                fontSize="13"
                                fontWeight="600"
                                fill="#047857"
                            >
                                x{step.n + 1}
                            </text>

                            <text
                                x={scaleX(step.xn) + 10}
                                y={scaleY(step.fxn) - 10}
                                fontSize="13"
                                fontWeight="600"
                                fill="#b91c1c"
                            >
                                f(x{step.n})
                            </text>
                        </>
                    )}

                    <text x={width - 12} y={height - 14} textAnchor="end" fontSize="12" fill="#6b7280">
                        drag to pan, wheel to zoom
                    </text>
                </svg>
            </div>
        </div>
    );
}
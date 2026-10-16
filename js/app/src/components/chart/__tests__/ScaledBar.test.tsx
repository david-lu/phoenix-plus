import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import type { BarShapeProps } from "recharts";
import { BarChart, XAxis, YAxis } from "recharts";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { ScaledBar } from "../ScaledBar";

function renderBar({ x, y, width, height }: BarShapeProps) {
  return (
    <rect className="test-bar" x={x} y={y} width={width} height={height} />
  );
}

function TestChart({ width, height }: { width: number; height: number }) {
  return (
    <BarChart
      width={width}
      height={height}
      data={[
        { name: "First", error: 2, ok: 4 },
        { name: "Second", error: 1, ok: 3 },
      ]}
    >
      <XAxis dataKey="name" />
      <YAxis domain={[0, 8]} />
      <ScaledBar
        id="error-bars"
        dataKey="error"
        stackId="count"
        shape={renderBar}
      />
      <ScaledBar id="ok-bars" dataKey="ok" stackId="count" shape={renderBar} />
    </BarChart>
  );
}

describe("ScaledBar", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
  });

  it("snaps stacked bar geometry to a resized plot without remounting its entrance animation", () => {
    act(() => root.render(<TestChart width={500} height={300} />));
    const series = container.querySelector(
      "#ok-bars > .recharts-bar-rectangles"
    );
    const originalBar =
      container.querySelector<SVGRectElement>("#ok-bars .test-bar")!;
    const originalX = Number(originalBar.getAttribute("x"));

    act(() => root.render(<TestChart width={300} height={180} />));

    expect(container.querySelector("#ok-bars > .recharts-bar-rectangles")).toBe(
      series
    );
    const baseline = Number(
      container.querySelector(".recharts-xAxis line")!.getAttribute("y1")
    );
    const lowerBars = container.querySelectorAll<SVGRectElement>(
      "#error-bars .test-bar"
    );
    const upperBars =
      container.querySelectorAll<SVGRectElement>("#ok-bars .test-bar");
    expect(lowerBars).toHaveLength(2);
    expect(upperBars).toHaveLength(2);
    expect(Number(upperBars[0].getAttribute("x"))).not.toBe(originalX);
    for (let index = 0; index < lowerBars.length; index++) {
      const lowerTop = Number(lowerBars[index].getAttribute("y"));
      const lowerBottom =
        lowerTop + Number(lowerBars[index].getAttribute("height"));
      const upperBottom =
        Number(upperBars[index].getAttribute("y")) +
        Number(upperBars[index].getAttribute("height"));
      expect(lowerBottom).toBeCloseTo(baseline);
      expect(upperBottom).toBeCloseTo(lowerTop);
    }
    expect(getComputedStyle(series!).transformOrigin).toContain(
      `${baseline}px`
    );
  });
});

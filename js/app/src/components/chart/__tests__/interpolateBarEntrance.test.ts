import type { BarRectangleItem } from "recharts";
import { describe, expect, it } from "vitest";

import { interpolateBarEntrance } from "../interpolateBarEntrance";

const lowerBar: BarRectangleItem = {
  x: 20,
  y: 80,
  width: 10,
  height: 20,
  stackedBarStart: 100,
  value: [0, 2],
  tooltipPosition: { x: 25, y: 90 },
  parentViewBox: { x: 0, y: 0, width: 200, height: 100 },
  originalDataIndex: 0,
};
const upperBar: BarRectangleItem = {
  ...lowerBar,
  y: 50,
  height: 30,
  value: [2, 5],
};

describe("interpolateBarEntrance", () => {
  it.each([0, 0.25, 0.5, 1])(
    "keeps vertical stacks connected and anchored throughout entry at %s",
    (progress) => {
      const [lower, upper] = interpolateBarEntrance(
        [
          { status: "added", next: lowerBar },
          { status: "added", next: upperBar },
        ],
        progress,
        "horizontal"
      );
      expect(lower.y + lower.height).toBe(100);
      expect(upper.y + upper.height).toBe(lower.y);
      expect(lower.height + upper.height).toBe(50 * progress);
      expect(lower.x).toBe(lowerBar.x);
      expect(lower.width).toBe(lowerBar.width);
    }
  );

  it("grows horizontal stacks from their shared numeric baseline", () => {
    const [lower, upper] = interpolateBarEntrance(
      [
        {
          status: "added",
          next: { ...lowerBar, x: 60, width: 20, stackedBarStart: 60 },
        },
        {
          status: "added",
          next: { ...upperBar, x: 80, width: 30, stackedBarStart: 60 },
        },
      ],
      0.5,
      "vertical"
    );
    expect(lower.x).toBe(60);
    expect(lower.x + lower.width).toBe(upper.x);
    expect(lower.width + upper.width).toBe(25);
    expect(lower.y).toBe(lowerBar.y);
    expect(lower.height).toBe(lowerBar.height);
  });

  it.each(["horizontal", "vertical"] as const)(
    "uses final geometry on every resize frame in %s layout",
    (layout) => {
      const resized = {
        ...lowerBar,
        x: 10,
        y: 40,
        width: 5,
        height: 10,
        stackedBarStart: 50,
      };
      for (const progress of [0, 0.25, 0.5, 1]) {
        const [bar] = interpolateBarEntrance(
          [{ status: "matched", prev: lowerBar, next: resized }],
          progress,
          layout
        );
        expect(bar).toBe(resized);
      }
    }
  );

  it("grows a negative bar away from zero without moving its baseline", () => {
    const negativeBar = { ...lowerBar, y: 120, height: -20, value: -2 };
    const [bar] = interpolateBarEntrance(
      [{ status: "added", next: negativeBar }],
      0.5,
      "horizontal"
    );
    expect(bar.y).toBe(110);
    expect(bar.y + bar.height).toBe(100);
  });

  it("drops removed bars and handles empty input", () => {
    expect(
      interpolateBarEntrance(
        [{ status: "removed", prev: lowerBar }],
        0.5,
        "horizontal"
      )
    ).toEqual([]);
    expect(interpolateBarEntrance(null, 0, "horizontal")).toEqual([]);
  });
});

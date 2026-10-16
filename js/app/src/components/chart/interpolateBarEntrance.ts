import type { BarProps } from "recharts";

/**
 * Grow new bars from Recharts' numeric baseline, scaling stacked segments
 * together. Existing bars snap to their target geometry: Recharts also calls
 * this on resize, when interpolating old pixel coordinates would lag the axes.
 *
 * Recharts owns timing, easing, item matching, and reduced-motion handling.
 */
export const interpolateBarEntrance: NonNullable<
  BarProps["animationInterpolateFn"]
> = (items, progress, layout) => {
  return (items ?? []).flatMap((item) => {
    if (item.status === "removed") {
      return [];
    }
    const { next } = item;
    if (item.status === "matched" || progress === 1) {
      return [next];
    }
    const baseline = next.stackedBarStart;
    return [
      layout === "horizontal"
        ? {
            ...next,
            y: baseline + (next.y - baseline) * progress,
            height: next.height * progress,
          }
        : {
            ...next,
            x: baseline + (next.x - baseline) * progress,
            width: next.width * progress,
          },
    ];
  });
};

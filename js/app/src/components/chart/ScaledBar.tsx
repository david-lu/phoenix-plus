import { css, keyframes } from "@emotion/react";
import type { BarProps } from "recharts";
import { Bar, useYAxisScale } from "recharts";

import { COMPACT_CHART_ANIMATION_DURATION_MS } from "./defaults";

const growBar = keyframes`
  from {
    transform: scaleY(0);
  }
  to {
    transform: scaleY(1);
  }
`;

/**
 * Vertical bars that grow from zero on entry. Geometry updates immediately on
 * resize; the series group stays mounted so its CSS animation does not replay.
 * Stacked series share the same zero baseline instead of scaling independently.
 */
export function ScaledBar(props: BarProps) {
  const scale = useYAxisScale(props.yAxisId);
  const baseline = scale?.(0) ?? 0;

  return (
    <Bar
      {...props}
      isAnimationActive={false}
      css={css`
        .recharts-bar-rectangles {
          transform-box: view-box;
          transform-origin: 0 ${baseline}px;
          animation: ${growBar} ${COMPACT_CHART_ANIMATION_DURATION_MS}ms
            ease-out;
        }

        @media (prefers-reduced-motion: reduce) {
          .recharts-bar-rectangles {
            animation: none;
          }
        }
      `}
    />
  );
}

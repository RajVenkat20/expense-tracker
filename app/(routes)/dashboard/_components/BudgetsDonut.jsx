"use client";

import * as React from "react";
import { PieChart, Pie, Cell, Label } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

/**
 * Donut chart for Budget allocation by category.
 * Expects budgetList = [{ name, amount, ... }, ...]
 */
function BudgetsDonut({ budgetList = [] }) {
  // shadcn provides 5 chart color tokens out of the box. Cycle through them.
  const COLORS = [
    // "#eef2ff", //indigo-50
    // "#e0e7ff", //indigo-100
    "#c7d2fe",
    "#a5b4fc",
    "#818cf8",
    "#6366f1",
    "#4f46e5",
    "#4338ca",
    "#3730a3",
    "#312e81",
  ];

  const data = (budgetList || []).map((b, i) => ({
    name: b.name,
    value: Number(b.amount ?? 0),
    fill: COLORS[i % COLORS.length],
  }));

  const total = data.reduce((sum, d) => sum + (d.value || 0), 0);

  if (!data.length) {
    return (
      <div className="flex h-48 items-center justify-center text-sm text-gray-500">
        No budgets yet
      </div>
    );
  }

  return (
    <ChartContainer className="mx-auto aspect-square max-h-[320px]" config={{}}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          innerRadius={70}
          outerRadius={120}
          strokeWidth={2}
          isAnimationActive
        >
          {data.map((entry, idx) => (
            <Cell key={idx} fill={entry.fill} />
          ))}

          {/* Center label */}
          <Label
            content={({ viewBox }) => {
              if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                return (
                  <text
                    x={viewBox.cx}
                    y={viewBox.cy}
                    textAnchor="middle"
                    dominantBaseline="middle"
                  >
                    <tspan className="fill-gray-900 text-xl font-bold">
                      ${total.toLocaleString()}
                    </tspan>
                    <tspan
                      x={viewBox.cx}
                      y={(viewBox.cy || 0) + 18}
                      className="fill-gray-500 text-xs"
                    >
                      Total Budget Allocated
                    </tspan>
                  </text>
                );
              }
              return null;
            }}
          />
        </Pie>

        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent hideLabel />}
        />
      </PieChart>
    </ChartContainer>
  );
}

export default BudgetsDonut;

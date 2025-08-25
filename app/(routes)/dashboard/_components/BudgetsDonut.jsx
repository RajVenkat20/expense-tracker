"use client";

import * as React from "react";
import { PieChart, Pie, Cell, Label } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Loader2, ChartPie } from "lucide-react";
import Link from "next/link";

function BudgetsDonut({ budgetList = [], isLoading = false }) {
  const COLORS = [
    "var(--chart-6)",
    "var(--chart-3)",
    "var(--chart-1)",
    "var(--chart-2)",
    "var(--chart-4)",
    "var(--chart-5)",
    "#c7d2fe",
    "#a5b4fc",
    "#818cf8",
    "#6366f1",
    "#4f46e5",
    "#4338ca",
    "#3730a3",
    "#312e81",
  ];

  // Loading UI (keeps size to avoid layout shift)
  if (isLoading) {
    return (
      <ChartContainer
        className="mx-auto aspect-square max-h-[320px]"
        config={{}}
      >
        <div className="flex h-full w-full items-center justify-center gap-2">
          <Loader2 className="h-5 w-5 animate-spin text-indigo-600" />
          <span className="text-sm text-gray-600">Loading your data…</span>
        </div>
      </ChartContainer>
    );
  }

  const data = (budgetList || []).map((b, i) => ({
    name: b.name,
    value: Number(b.amount ?? 0),
    fill: COLORS[i % COLORS.length],
  }));
  const total = data.reduce((sum, d) => sum + (d.value || 0), 0);

  const hasRows = Array.isArray(data) && data.length > 0;
  const hasNonZero = hasRows && data.some((d) => Number(d.value) > 0);

  // Friendlier empty state (no rows OR all zeros)
  if (!hasNonZero) {
    return (
      <ChartContainer
        className="mx-auto aspect-square max-h-[320px]"
        config={{}}
      >
        <div className="flex h-full w-full flex-col items-center justify-center rounded-md border border-dashed border-indigo-200 bg-indigo-50/30 p-6 text-center">
          <ChartPie className="h-6 w-6 text-indigo-500 mb-2" />
          <p className="text-sm font-medium text-gray-700">
            No expense categories breakdown yet
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Create an expense category or assign amounts to see your distribution.
          </p>
          <Link
            href="/dashboard/budgets"
            className="mt-3 inline-flex items-center rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm transition-colors hover:bg-indigo-700"
          >
            Create Expense Category
          </Link>
        </div>
      </ChartContainer>
    );
  }

  return (
    <div>
      <h2 className="font-bold text-lg mb-4">Expense Categories Breakdown</h2>
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
                      Total Allocated
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
    </div>
  );
}

export default BudgetsDonut;

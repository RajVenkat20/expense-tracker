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
    "#6366f1",
    "#22c55e",
    "#f97316",
    "#ef4444",
    "#0ea5e9",
    "#a855f7",
    "#14b8a6",
    "#eab308",
  ];

  if (isLoading) {
    return (
      <div className="w-full rounded-2xl bg-white p-6 shadow-lg shadow-indigo-200">
        <ChartContainer className="mx-auto aspect-square max-h-[320px]" config={{}}>
          <div className="flex h-full w-full items-center justify-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin text-indigo-600" />
            <span className="text-sm text-gray-600">
              Loading category breakdown…
            </span>
          </div>
        </ChartContainer>
      </div>
    );
  }

  const data = (budgetList || []).map((b, i) => ({
    name: b.name,
    value: Number(b.amount ?? 0),
    fill: COLORS[i % COLORS.length],
  }));

  const total = data.reduce((sum, d) => sum + (d.value || 0), 0);
  const hasData = data.some((d) => d.value > 0);

  if (!hasData) {
    return (
      <div className="w-full rounded-2xl bg-white">
        <ChartContainer className="mx-auto" config={{}}>
          <div className="flex h-full w-full flex-col items-center justify-center rounded-xl border border-dashed border-indigo-200 bg-indigo-50/40 p-6 text-center">
            <ChartPie className="h-7 w-7 text-indigo-500 mb-2" />
            <p className="text-sm font-semibold text-gray-700">
              No expense breakdown yet
            </p>
            <p className="text-xs text-gray-500 mt-1 max-w-[220px]">
              Add categories and allocate amounts to visualize your spending.
            </p>
            <Link
              href="/dashboard/budgets"
              className="mt-4 inline-flex items-center rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-indigo-700 transition-all hover:shadow-indigo-300 hover:scale-105"
            >
              Create Expense Category
            </Link>
          </div>
        </ChartContainer>
      </div>
    );
  }

  return (
    <div className="w-full rounded-2xl bg-white">
      {/* Header */}
      <div className="mb-4">
        <h2 className="font-bold text-lg text-gray-800">
          Expense Categories
        </h2>
        <p className="text-sm text-gray-400">
          Distribution of allocated budgets
        </p>
      </div>

      {/* Chart */}
      <ChartContainer className="mx-auto aspect-square max-h-[320px]" config={{}}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius={72}
            outerRadius={120}
            paddingAngle={2}
            strokeWidth={2}
            isAnimationActive
          >
            {data.map((entry, idx) => (
              <Cell
                key={idx}
                fill={entry.fill}
                className="transform transition-all ease-out duration-300 hover:shadow-lg hover:scale-[1.04]"
              />
            ))}

            <Label
              content={({ viewBox }) => {
                if (!viewBox?.cx || !viewBox?.cy) return null;
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
                      y={viewBox.cy + 18}
                      className="fill-gray-500 text-xs"
                    >
                      Total Budgeted
                    </tspan>
                  </text>
                );
              }}
            />
          </Pie>

          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent hideLabel />}
          />
        </PieChart>
      </ChartContainer>

      {/* Legend */}
      <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
        {data.map((d, i) => (
          <div key={i} className="flex items-center gap-2">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: d.fill }}
            />
            <span className="text-gray-600 truncate">{d.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default BudgetsDonut;

"use client";

import React, { useMemo } from "react";
import {
  Bar,
  BarChart,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Loader2, PieChart as PieChartIcon } from "lucide-react";

function BarChartDashboard({ budgetList = [], isLoading = false }) {
  // --- formatters ---
  const fmtMoney = (n, digits = 2) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: digits,
      minimumFractionDigits: digits,
    }).format(Number(n || 0));

  const fmtAxis = (n) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(Number(n || 0));

  // Build chart rows: usedWithin + remaining (and optional overspend)
  const data = useMemo(() => {
    return (Array.isArray(budgetList) ? budgetList : []).map((b) => {
      const allocated = Number(b.amount || 0);
      const used = Number(b.totalSpend || 0);

      const usedWithin = Math.min(used, allocated); // part of used within allocation
      const remaining = Math.max(allocated - used, 0); // leftover part of allocation
      const over = Math.max(used - allocated, 0); // spent beyond allocation

      return {
        name: b.name,
        usedWithin,
        remaining,
        over,
        allocated, // keep originals for tooltip
        used, // "
      };
    });
  }, [budgetList]);

  const hasRows = data.length > 0;
  const hasNonZero = hasRows && data.some((d) => d.allocated > 0 || d.used > 0);

  // Nice Y domain with headroom so labels don't touch the top
  const yMax = useMemo(() => {
    if (!hasNonZero) return 0;
    const max = Math.max(
      ...data.map((d) => Math.max(d.allocated, d.used))
    );
    return Math.ceil(max * 1.12); // 12% headroom
  }, [data, hasNonZero]);

  return (
    <div className="rounded-lg">
      <h2 className="font-bold text-lg mb-4">Spending Breakdown for Expense Types</h2>

      {isLoading ? (
        <div className="h-[300px] flex items-center justify-center gap-2 rounded-md bg-gradient-to-br from-indigo-50 to-white">
          <Loader2 className="h-5 w-5 animate-spin text-indigo-600" />
          <span className="text-sm text-gray-600">Loading your data…</span>
        </div>
      ) : !hasNonZero ? (
        <div className="h-[300px] flex flex-col items-center justify-center rounded-md border border-dashed border-indigo-200 bg-indigo-50/30 text-center">
          <PieChartIcon className="h-6 w-6 text-indigo-500 mb-2" />
          <p className="text-sm font-medium text-gray-700">No data to show</p>
          <p className="text-xs text-gray-500 mt-1">
            Create an expense category or add amounts to see the breakdown.
          </p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={320}>
          <BarChart
            data={data}
            margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
            barCategoryGap="20%"
          >
            {/* Gradients + stripes */}
            <defs>
              <linearGradient id="usedGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#6366F1" />
                <stop offset="100%" stopColor="#8B5CF6" />
              </linearGradient>
              <linearGradient id="remainGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#93C5FD" />
                <stop offset="100%" stopColor="#A7F3D0" />
              </linearGradient>
              <pattern id="overPattern" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                <rect width="6" height="6" fill="#FCA5A5" />
                <rect width="2" height="6" fill="#EF4444" />
              </pattern>
            </defs>

            <XAxis
              dataKey="name"
              tickMargin={8}
              interval={0}
            />
            <YAxis
              tickFormatter={fmtAxis}
              domain={[0, yMax]}
              tickMargin={8}
            />
            <Tooltip
              cursor={{ fill: "rgba(0,0,0,0.04)" }}
              content={({ active, payload, label }) => {
                if (!active || !payload || !payload.length) return null;
                const row = payload[0].payload;
                return (
                  <div className="rounded-md bg-white px-3 py-2 shadow-md border text-sm">
                    <div className="font-semibold mb-1">{label}</div>
                    <div>Amount Used: <b>{fmtMoney(row.used)}</b></div>
                    <div>Amount Allocated: <b>{fmtMoney(row.allocated)}</b></div>
                    {row.over > 0 && (
                      <div className="text-red-600">Over by: <b>{fmtMoney(row.over)}</b></div>
                    )}
                  </div>
                );
              }}
            />
            <Legend wrapperStyle={{ marginTop: 30 }} />
            {/* Stacked = allocation (usedWithin + remaining) plus any overspend on top */}
            <Bar
              dataKey="usedWithin"
              name="Amount Used"
              stackId="a"
              fill="url(#usedGrad)"
              radius={[4, 4, 4, 4]}
            />
            <Bar
              dataKey="remaining"
              name="Remaining Allocation"
              stackId="a"
              fill="url(#remainGrad)"
              radius={[4, 4, 4, 4]}
            />
            <Bar
              dataKey="over"
              name="Over"
              stackId="a"
              fill="url(#overPattern)"
              stroke="#DC2626"
              strokeWidth={1}
              radius={[4, 4, 4, 4]}
            />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

export default BarChartDashboard;

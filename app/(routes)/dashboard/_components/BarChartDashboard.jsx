"use client";

import React, { useMemo, useEffect, useState } from "react";
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
  /* -------------------------------------------------------------------------- */
  /*  Responsive helpers                                                         */
  /* -------------------------------------------------------------------------- */
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  /* -------------------------------------------------------------------------- */
  /*  Formatters                                                                  */
  /* -------------------------------------------------------------------------- */
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

  /* -------------------------------------------------------------------------- */
  /*  Data preparation                                                           */
  /* -------------------------------------------------------------------------- */
  const data = useMemo(() => {
    return (Array.isArray(budgetList) ? budgetList : []).map((b) => {
      const allocated = Number(b.amount || 0);
      const used = Number(b.totalSpend || 0);

      return {
        name: b.name,
        usedWithin: Math.min(used, allocated),
        remaining: Math.max(allocated - used, 0),
        over: Math.max(used - allocated, 0),
        allocated,
        used,
      };
    });
  }, [budgetList]);

  const monthName = useMemo(() => {
    try {
      return new Date().toLocaleString(undefined, { month: "long" });
    } catch {
      return new Date().toLocaleString("en-US", { month: "long" });
    }
  }, []);

  const hasNonZero =
    data.length > 0 && data.some((d) => d.allocated > 0 || d.used > 0);

  const yMax = useMemo(() => {
    if (!hasNonZero) return 0;
    const max = Math.max(...data.map((d) => Math.max(d.allocated, d.used)));
    return Math.ceil(max * 1.12);
  }, [data, hasNonZero]);

  /* -------------------------------------------------------------------------- */
  /*  Render                                                                      */
  /* -------------------------------------------------------------------------- */
  return (
    <div className="rounded-lg">
      <div className="w-full rounded-2xl bg-white">
        <h2 className="font-bold text-lg">
          Spending Breakdown for {monthName}
        </h2>
        <p className="text-sm text-gray-400">
          How your spending compares to monthly budgets
        </p>
      </div>

      {isLoading ? (
        <div className="h-[200px] flex items-center justify-center gap-2 rounded-md bg-gradient-to-br from-indigo-50 to-white">
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
        <ResponsiveContainer width="100%" height={420}>
          <BarChart
            data={data}
            margin={{
              top: 8,
              right: 8,
              left: 0,
              bottom: isMobile ? 40 : 20, // 👈 room for rotated labels
            }}
            barCategoryGap="20%"
          >
            {/* Gradients + patterns */}
            <defs>
              <linearGradient id="usedGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#6366F1" />
                <stop offset="100%" stopColor="#8B5CF6" />
              </linearGradient>
              <linearGradient id="remainGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#93C5FD" />
                <stop offset="100%" stopColor="#A7F3D0" />
              </linearGradient>
              <pattern
                id="overPattern"
                width="6"
                height="6"
                patternUnits="userSpaceOnUse"
                patternTransform="rotate(45)"
              >
                <rect width="6" height="6" fill="#FCA5A5" />
                <rect width="2" height="6" fill="#EF4444" />
              </pattern>
            </defs>

            {/* X / Y Axes */}
            <XAxis
              dataKey="name"
              interval={0}
              tick={{
                angle: isMobile ? -35 : 0,
                textAnchor: isMobile ? "end" : "middle",
              }}
              tickMargin={10}
              height={isMobile ? 60 : 40}
            />

            <YAxis tickFormatter={fmtAxis} domain={[0, yMax]} tickMargin={8} />

            {/* Tooltip */}
            <Tooltip
              cursor={{ fill: "rgba(0,0,0,0.04)" }}
              content={({ active, payload, label }) => {
                if (!active || !payload?.length) return null;
                const row = payload[0].payload;
                return (
                  <div className="rounded-md bg-white px-3 py-2 shadow-md border text-sm">
                    <div className="font-semibold mb-1">{label}</div>
                    <div>
                      Amount Used: <b>{fmtMoney(row.used)}</b>
                    </div>
                    <div>
                      Amount Allocated: <b>{fmtMoney(row.allocated)}</b>
                    </div>
                    {row.over > 0 && (
                      <div className="text-red-600">
                        Over by: <b>{fmtMoney(row.over)}</b>
                      </div>
                    )}
                  </div>
                );
              }}
            />

            <Legend
              verticalAlign="top"
              align="center"
              margin={{ bottom: 10 }}
            />

            {/* Bars */}
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

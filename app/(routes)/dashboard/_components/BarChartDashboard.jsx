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
  // Build chart rows: usedWithin + remaining (and optional overspend)
  const data = useMemo(() => {
    return (Array.isArray(budgetList) ? budgetList : []).map((b) => {
      const allocated = Number(b.amount || 0);
      const used = Number(b.totalSpend || 0);

      const usedWithin = Math.min(used, allocated);          // part of used within allocation
      const remaining = Math.max(allocated - used, 0);       // leftover part of allocation
      const over = Math.max(used - allocated, 0);            // spent beyond allocation

      return {
        name: b.name,
        usedWithin,
        remaining,
        over,
        allocated,   // keep the originals for tooltip
        used,        // "
      };
    });
  }, [budgetList]);

  const hasRows = data.length > 0;
  const hasNonZero =
    hasRows && data.some((d) => d.allocated > 0 || d.used > 0);

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
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} margin={{ top: 7 }}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip
              cursor={{ fill: "rgba(0,0,0,0.04)" }}
              content={({ active, payload, label }) => {
                if (!active || !payload || !payload.length) return null;
                const row = payload[0].payload;
                return (
                  <div className="rounded-md bg-white px-3 py-2 shadow-md border text-sm">
                    <div className="font-semibold mb-1">{label}</div>
                    <div>Amount Used: <b>{row.used}</b></div>
                    <div>Amount Allocated: <b>{row.allocated}</b></div>
                    {row.over > 0 && (
                      <div className="text-red-600">Over by: <b>{row.over}</b></div>
                    )}
                  </div>
                );
              }}
            />
            <Legend wrapperStyle={{ marginTop: 30 }} />
            {/* Stack to make the total bar height = allocation + (any overspend) */}
            <Bar dataKey="usedWithin" name="Amount Used" stackId="a" fill="#4f46e5" />
            <Bar dataKey="remaining" name="Remaining Allocation" stackId="a" fill="#c7d2fe" />
            <Bar dataKey="over" name="Over" stackId="a" fill="#fb7185" />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

export default BarChartDashboard;

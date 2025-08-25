"use client";

import React from "react";
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
  const hasRows = Array.isArray(budgetList) && budgetList.length > 0;
  const hasNonZero =
    hasRows &&
    budgetList.some(
      (b) => Number(b.amount || 0) > 0 || Number(b.totalSpend || 0) > 0
    );

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
          <p className="text-xs text-gray-500 mt-1">Create an expense category or add amounts to see the breakdown.</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={budgetList} margin={{ top: 7 }}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend wrapperStyle={{ marginTop: 30 }} />
            <Bar dataKey="totalSpend" name="Amount Used" stackId="a" fill="#4845d2" />
            <Bar dataKey="amount" name="Amount Allocated" stackId="a" fill="#C3C2FF" />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

export default BarChartDashboard;

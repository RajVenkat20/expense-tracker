"use client";

import React, { useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { Button } from "@/components/ui/button";

const RANGE_OPTIONS = [
  { label: "1M", value: 1 },
  { label: "3M", value: 3 },
  { label: "6M", value: 6 },
  { label: "1Y", value: 12 },
];

const currencyFormatter = (value) =>
  `$${Number(value).toLocaleString()}`;

function formatPeriod(period, rangeMonths) {
  if (rangeMonths === 1) {
    const d = new Date(period);
    return `Week of ${d.toLocaleDateString("default", {
      month: "short",
      day: "numeric",
    })}`;
  }
  const [y, m] = period.split("-");
  return new Date(y, m - 1).toLocaleString("default", {
    month: "short",
    year: "2-digit",
  });
}

function ExpenseAreaChart({ expenses = [], rangeMonths = 1, onRangeChange }) {
  const data = useMemo(() => {
    if (!expenses.length) return [];
    const buckets = {};

    expenses.forEach((exp) => {
      const d = new Date(exp.createdAt);
      let key;

      if (rangeMonths === 1) {
        const weekStart = new Date(d);
        const day = d.getDay() === 0 ? 6 : d.getDay() - 1;
        weekStart.setDate(d.getDate() - day);
        weekStart.setHours(0, 0, 0, 0);
        key = weekStart.toISOString().slice(0, 10);
      } else {
        key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      }

      if (!buckets[key]) buckets[key] = 0;
      buckets[key] += Number(exp.amount);
    });

    return Object.entries(buckets)
      .map(([k, v]) => ({
        period: k,
        amount: v,
        label: formatPeriod(k, rangeMonths),
      }))
      .sort((a, b) => a.period.localeCompare(b.period));
  }, [expenses, rangeMonths]);

  const hasData = data.some((d) => d.amount > 0);

  return (
    <div className="w-full rounded-2xl bg-white p-5 shadow-lg shadow-indigo-200 mb-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-bold text-lg text-gray-800">
            Spending Trend
          </h3>
          <p className="text-sm text-gray-400">
            Expenses over time
          </p>
        </div>

        <div className="flex gap-1 bg-indigo-50 p-1 rounded-lg">
          {RANGE_OPTIONS.map((opt) => (
            <Button
              key={opt.value}
              size="sm"
              className={`transition-all duration-200 ${
                rangeMonths === opt.value
                  ? "bg-indigo-600 text-white shadow"
                  : "bg-transparent text-indigo-600 hover:bg-indigo-100"
              }`}
              onClick={() => onRangeChange(opt.value)}
            >
              {opt.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Chart */}
      {hasData ? (
        <div className="rounded-xl bg-gradient-to-br from-indigo-50 to-white p-4">
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart
              data={data}
              margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient
                  id="expenseGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="0%" stopColor="#6366F1" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="#6366F1" stopOpacity={0.05} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 12, fill: "#6b7280" }}
              />
              <YAxis
                tick={{ fontSize: 12, fill: "#6b7280" }}
                tickFormatter={currencyFormatter}
              />
              <Tooltip
                formatter={(v) => currencyFormatter(v)}
                contentStyle={{
                  backgroundColor: "#ffffff",
                  borderRadius: "8px",
                  border: "1px solid #e5e7eb",
                }}
              />
              <Area
                type="monotone"
                dataKey="amount"
                stroke="#6366F1"
                strokeWidth={2}
                fill="url(#expenseGradient)"
                dot={{ r: 3 }}
                activeDot={{ r: 6 }}
                isAnimationActive
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-[240px] rounded-xl bg-indigo-50 border border-dashed border-indigo-200">
          <svg
            width="44"
            height="44"
            fill="none"
            viewBox="0 0 24 24"
            stroke="#6366f1"
            strokeWidth="1.5"
            className="mb-3"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 8v4l2.5 2.5m7.5-2.5a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div className="font-semibold text-gray-700">
            No expenses yet
          </div>
          <div className="text-gray-400 text-sm mt-1">
            Start logging expenses to see trends.
          </div>
        </div>
      )}
    </div>
  );
}

export default ExpenseAreaChart;

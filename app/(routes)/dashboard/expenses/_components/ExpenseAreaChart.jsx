"use client";

import React, { useMemo } from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { Button } from "@/components/ui/button";

const RANGE_OPTIONS = [
  { label: "1M", value: 1 },
  { label: "3M", value: 3 },
  { label: "6M", value: 6 },
  { label: "1Y", value: 12 },
];

function ExpenseAreaChart({ expenses = [], rangeMonths = 1, onRangeChange }) {
  // Group expenses by month (or week if range is 1M)
  const data = useMemo(() => {
    if (!expenses.length) return [];
    const now = new Date();
    const buckets = {};
    expenses.forEach((exp) => {
      const d = new Date(exp.createdAt);
      let key;
      if (rangeMonths === 1) {
        // group by week
        const weekStart = new Date(d);
        const day = d.getDay() === 0 ? 6 : d.getDay() - 1;
        weekStart.setDate(d.getDate() - day);
        weekStart.setHours(0,0,0,0);
        key = weekStart.toISOString().slice(0, 10);
      } else {
        // group by month
        key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      }
      if (!buckets[key]) buckets[key] = 0;
      buckets[key] += Number(exp.amount);
    });
    // Convert to sorted array
    return Object.entries(buckets)
      .map(([k, v]) => ({ period: k, amount: v }))
      .sort((a, b) => a.period.localeCompare(b.period));
  }, [expenses, rangeMonths]);

  return (
    <div className="mb-8">
      <div className="flex gap-2 mb-2 ">
        {RANGE_OPTIONS.map((opt) => (
          <Button
            key={opt.value}
            size="sm"
            variant={rangeMonths === opt.value ? "default" : "outline"}
            onClick={() => onRangeChange(opt.value)}
          >
            {opt.label}
          </Button>
        ))}
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorSpend" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366F1" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#6366F1" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <XAxis dataKey="period" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <CartesianGrid strokeDasharray="3 3" />
          <Tooltip formatter={(v) => `$${Number(v).toFixed(2)}`} />
          <Area type="monotone" dataKey="amount" stroke="#6366F1" fillOpacity={1} fill="url(#colorSpend)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export default ExpenseAreaChart;

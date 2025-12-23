import React, { useEffect, useState } from "react";
import { db } from "@/utils/dbConfig";
import { Income, Expenses } from "@/utils/schema";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Button } from "@/components/ui/button";

const RANGE_OPTIONS = [
  { label: "3M", value: 3 },
  { label: "6M", value: 6 },
  { label: "1Y", value: 12 },
];

function formatMonthYear(month, year) {
  const date = new Date(year, month - 1);
  return date.toLocaleString("default", { month: "short", year: "2-digit" });
}

export default function IncomeExpensesBarChart({ userId }) {
  const [range, setRange] = useState(6);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    (async () => {
      const now = new Date();
      const months = [];
      for (let i = range - 1; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        months.push({ month: d.getMonth() + 1, year: d.getFullYear() });
      }
      // Query all income and expenses for these months
      const incomeResults = await db
        .select()
        .from(Income)
        .where(
          Income.userId
            ? Income.userId === userId
            : Income.createdBy === userId
        );
      const expenseResults = await db
        .select()
        .from(Expenses)
        .where(
          Expenses.userId
            ? Expenses.userId === userId
            : Expenses.createdBy === userId
        );
      // Aggregate by month/year
      const chartData = months.map(({ month, year }) => {
        const income = incomeResults
          .filter(
            (r) =>
              new Date(r.createdAt).getMonth() + 1 === month &&
              new Date(r.createdAt).getFullYear() === year
          )
          .reduce((sum, r) => sum + Number(r.amount), 0);
        const expenses = expenseResults
          .filter(
            (r) =>
              new Date(r.createdAt).getMonth() + 1 === month &&
              new Date(r.createdAt).getFullYear() === year
          )
          .reduce((sum, r) => sum + Number(r.amount), 0);
        return {
          name: formatMonthYear(month, year),
          income,
          expenses,
        };
      });
      setData(chartData);
      setLoading(false);
    })();
  }, [userId, range]);

  const hasData = data.some((d) => d.income !== 0 || d.expenses !== 0);
  return (
    <div className="w-full bg-white rounded-xl shadow-md p-6 mb-6 mt-5 shadow-indigo-300">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-lg">Income vs Expenses (Bar Chart)</h3>
        <div className="flex gap-2">
          {RANGE_OPTIONS.map((opt) => (
            <Button
              key={opt.value}
              variant={range === opt.value ? "default" : "outline"}
              onClick={() => setRange(opt.value)}
              size="sm"
            >
              {opt.label}
            </Button>
          ))}
        </div>
      </div>
      {hasData ? (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip formatter={(v) => v.toLocaleString()} />
            <Legend />
            <Bar dataKey="income" fill="#10b981" name="Income" />
            <Bar dataKey="expenses" fill="#f43f5e" name="Expenses" />
          </BarChart>
        </ResponsiveContainer>
      ) : !loading ? (
        <div className="flex flex-col items-center justify-center h-[300px] bg-[#f7f9fb] rounded-lg border border-dashed border-indigo-100">
          <svg width="48" height="48" fill="none" viewBox="0 0 24 24" stroke="#6366f1" strokeWidth="1.5" className="mb-2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l2.5 2.5m7.5-2.5a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="font-semibold text-gray-700 text-lg mb-1">No data yet</div>
          <div className="text-gray-400">Add income or expenses to see your trend.</div>
        </div>
      ) : null}
      {loading && <div className="text-center text-gray-500 mt-2">Loading...</div>}
    </div>
  );
}

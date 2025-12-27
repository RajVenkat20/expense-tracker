import React, { useEffect, useState } from "react";
import { db } from "@/utils/dbConfig";
import { Income, Expenses } from "@/utils/schema";
import { eq } from "drizzle-orm";
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

// Custom Tooltip to render value in bold
function CustomTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    return (
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, padding: 12 }}>
        <div style={{ marginBottom: 4, color: '#6b7280', fontWeight: 600 }}>{label}</div>
        {payload.map((entry, idx) => (
          <div key={idx} style={{ color: entry.color, marginBottom: 2 }}>
            {entry.name}: <span style={{ fontWeight: 'bold' }}>{currencyFormatter(entry.value)}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
}
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

const currencyFormatter = (value) =>
  `$${Number(value).toLocaleString()}`;

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

      const incomeResults = await db
        .select()
        .from(Income)
        .where(eq(Income.createdBy, userId));

      const expenseResults = await db
        .select()
        .from(Expenses)
        .where(eq(Expenses.createdBy, userId));

      const chartData = months.map(({ month, year }) => {
        const incStartDateStr = `${year}-${String(month).padStart(2, '0')}-01`;
        const incEndDateObj = new Date(year, month, 0);
        const incEndDateStr = `${year}-${String(month).padStart(2, '0')}-${String(incEndDateObj.getDate()).padStart(2, '0')}`;
        const filteredIncome = incomeResults.filter((r) => {
          const createdStr = r.createdAt.slice(0, 10); // "YYYY-MM-DD"
          return createdStr >= incStartDateStr && createdStr <= incEndDateStr;
        });
        const income = filteredIncome.reduce((sum, r) => sum + Number(r.amount), 0);

        const startDateStr = `${year}-${String(month).padStart(2, '0')}-01`;
        const endDateObj = new Date(year, month, 0);
        const endDateStr = `${year}-${String(month).padStart(2, '0')}-${String(endDateObj.getDate()).padStart(2, '0')}`;
        const filteredExpenses = expenseResults.filter((r) => {
          const createdStr = r.createdAt.slice(0, 10); // "YYYY-MM-DD"
          return createdStr >= startDateStr && createdStr <= endDateStr;
        });

        const expenses = filteredExpenses.reduce((sum, r) => sum + Number(r.amount), 0);

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
    <div className="w-full rounded-2xl bg-white p-6 mb-6 mt-5 shadow-lg shadow-indigo-200">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="font-bold text-lg text-gray-800">
            Income vs Expenses
          </h3>
          <p className="text-sm text-gray-400">
            Monthly comparison overview
          </p>
        </div>

        <div className="flex gap-1 bg-indigo-50 p-1 rounded-lg">
          {RANGE_OPTIONS.map((opt) => (
            <Button
              key={opt.value}
              size="sm"
              className={`transition-all duration-200 ${
                range === opt.value
                  ? "bg-indigo-600 text-white shadow"
                  : "bg-transparent text-indigo-600 hover:bg-indigo-100"
              }`}
              onClick={() => setRange(opt.value)}
            >
              {opt.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Chart */}
      {hasData ? (
        <div className="rounded-xl bg-gradient-to-br from-indigo-50 to-white p-4">
          <ResponsiveContainer width="100%" height={320}>
            <BarChart
              data={data}
              margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
              barGap={6}
            >
              <defs>
                <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#34d399" />
                  <stop offset="100%" stopColor="#10b981" />
                </linearGradient>
                <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#fb7185" />
                  <stop offset="100%" stopColor="#f43f5e" />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="name"
                tick={{ fill: "#6b7280", fontSize: 12 }}
              />
              <YAxis
                tick={{ fill: "#6b7280", fontSize: 12 }}
                tickFormatter={currencyFormatter}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />

              <Bar
                dataKey="income"
                name="Income"
                fill="url(#incomeGradient)"
                radius={[6, 6, 0, 0]}
              />
              <Bar
                dataKey="expenses"
                name="Expenses"
                fill="url(#expenseGradient)"
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : !loading ? (
        <div className="flex flex-col items-center justify-center h-[320px] rounded-xl bg-indigo-50 border border-dashed border-indigo-200">
          <svg
            width="48"
            height="48"
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
          <div className="font-semibold text-gray-700 text-lg">
            No data yet
          </div>
          <div className="text-gray-400 text-sm mt-1">
            Add income or expenses to see insights.
          </div>
        </div>
      ) : null}

      {loading && (
        <div className="text-center text-gray-500 mt-3 animate-pulse">
          Loading chart data…
        </div>
      )}
    </div>
  );
}

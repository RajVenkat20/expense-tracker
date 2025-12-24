import React, { useEffect, useState } from "react";
import { db } from "@/utils/dbConfig";
import { Networth } from "@/utils/schema";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Button } from "@/components/ui/button";
import { eq, and, or } from "drizzle-orm";

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

export default function NetworthAreaChart({ userId }) {
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

      const results = await db
        .select()
        .from(Networth)
        .where(
          and(
            eq(Networth.userId, userId),
            or(
              ...months.map(({ month, year }) =>
                and(eq(Networth.month, month), eq(Networth.year, year))
              )
            )
          )
        )
        .orderBy(Networth.year, Networth.month);

      const chartData = months.map(({ month, year }) => {
        const rec = results.find(
          (r) => r.month === month && r.year === year
        );
        return {
          name: formatMonthYear(month, year),
          networth: rec ? Number(rec.amount) : 0,
        };
      });

      setData(chartData);
      setLoading(false);
    })();
  }, [userId, range]);

  const hasData = data.some((d) => d.networth !== 0);

  return (
    <div className="w-full rounded-2xl bg-white p-6 mb-6 mt-5 shadow-lg shadow-indigo-200">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="font-bold text-lg text-gray-800">
            Net Worth Over Time
          </h3>
          <p className="text-sm text-gray-400">
            Track your financial growth
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
            <AreaChart
              data={data}
              margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient
                  id="networthGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="0%" stopColor="#6366f1" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity={0.05} />
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
              <Tooltip
                formatter={(value) => currencyFormatter(value)}
                contentStyle={{
                  backgroundColor: "#ffffff",
                  borderRadius: "8px",
                  border: "1px solid #e5e7eb",
                }}
              />

              <Area
                type="monotone"
                dataKey="networth"
                stroke="#6366f1"
                strokeWidth={2}
                fill="url(#networthGradient)"
                dot={{ r: 3 }}
                activeDot={{ r: 6 }}
                isAnimationActive
              />
            </AreaChart>
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
            No net worth data yet
          </div>
          <div className="text-gray-400 text-sm mt-1">
            Add assets or savings to see growth.
          </div>
        </div>
      ) : null}

      {loading && (
        <div className="text-center text-gray-500 mt-3 animate-pulse">
          Loading net worth…
        </div>
      )}
    </div>
  );
}

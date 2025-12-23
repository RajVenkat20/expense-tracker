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
  LinearGradient,
  Stop,
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

export default function NetworthAreaChart({ userId }) {
  const [range, setRange] = useState(6);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    (async () => {
      // Get the latest N months of networth for the user
      const now = new Date();
      const months = [];
      for (let i = range - 1; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        months.push({ month: d.getMonth() + 1, year: d.getFullYear() });
      }
      // Query all networth records for these months
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

      // Debug logging
      console.log("NetworthAreaChart debug:", {
        userId,
        months,
        results,
      });

      // Map to chart data
      const chartData = months.map(({ month, year }) => {
        const rec = results.find((r) => r.month === month && r.year === year);
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
    <div className="w-full bg-white rounded-xl shadow-md p-6 mb-6 mt-5 shadow-indigo-300">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-lg">Networth Over Time</h3>
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
          <AreaChart
            data={data}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorNetworth" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip formatter={(v) => v.toLocaleString()} />
            <Area
              type="monotone"
              dataKey="networth"
              stroke="#6366f1"
              fillOpacity={1}
              fill="url(#colorNetworth)"
            />
          </AreaChart>
        </ResponsiveContainer>
      ) : !loading ? (
        <div className="flex flex-col items-center justify-center h-[300px] bg-[#f7f9fb] rounded-lg border border-dashed border-indigo-100">
          <svg
            width="48"
            height="48"
            fill="none"
            viewBox="0 0 24 24"
            stroke="#6366f1"
            strokeWidth="1.5"
            className="mb-2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 8v4l2.5 2.5m7.5-2.5a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div className="font-semibold text-gray-700 text-lg mb-1">
            No networth data yet
          </div>
          <div className="text-gray-400">
            Add income or expenses to see your trend.
          </div>
        </div>
      ) : null}
      {loading && (
        <div className="text-center text-gray-500 mt-2">Loading...</div>
      )}
    </div>
  );
}

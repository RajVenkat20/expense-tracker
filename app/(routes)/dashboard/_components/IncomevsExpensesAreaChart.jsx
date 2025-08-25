"use client";

import React from "react";
import { useUser } from "@clerk/nextjs";
import { and, eq, gte, sql } from "drizzle-orm";
import { db } from "@/utils/dbConfig";
import { Income, Expenses } from "@/utils/schema";

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { PieChart as PieChartIcon } from "lucide-react";

/* ---------- helpers ---------- */
const rangeToStartISO = (range) => {
  const end = new Date();
  const start = new Date();
  if (range === "7d") start.setDate(end.getDate() - 6);
  else if (range === "30d") start.setMonth(end.getMonth() - 1);
  else start.setMonth(end.getMonth() - 3); // "90d"
  return start.toISOString().slice(0, 10); // YYYY-MM-DD
};

// normalize Date | string -> 'YYYY-MM-DD'
const toKey = (d) =>
  typeof d === "string" ? d.slice(0, 10) : new Date(d).toISOString().slice(0, 10);

// fill day gaps so the line/area is continuous
const fillGaps = (startISO, map) => {
  const out = [];
  const start = new Date(startISO);
  const end = new Date();
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const key = d.toISOString().slice(0, 10);
    out.push(map.get(key) || { date: key, income: 0, expenses: 0 });
  }
  return out;
};

export default function IncomeVsExpensesArea({
  showHeader = true,
  stacked = false,
  refreshKey = 0, // bump to refetch
}) {
  const { user } = useUser();
  const [timeRange, setTimeRange] = React.useState("7d");
  const [data, setData] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (!user) return;

    const run = async () => {
      setLoading(true);
      try {
        const email = user?.primaryEmailAddress?.emailAddress ?? "";
        const startISO = rangeToStartISO(timeRange);

        // INCOME per day (Income.createdAt is DATE)
        const incomeRows = await db
          .select({
            date: Income.createdAt, // DATE column
            total: sql`SUM(${Income.amount})`.mapWith(Number).as("total"),
          })
          .from(Income)
          .where(and(eq(Income.createdBy, email), gte(Income.createdAt, sql`${startISO}::date`)))
          .groupBy(Income.createdAt)
          .orderBy(Income.createdAt);

        // EXPENSES per day (Expenses.createdAt is DATE)
        const expenseRows = await db
          .select({
            date: Expenses.createdAt, // DATE column
            total: sql`SUM(${Expenses.amount})`.mapWith(Number).as("total"),
          })
          .from(Expenses)
          .where(and(eq(Expenses.createdBy, email), gte(Expenses.createdAt, sql`${startISO}::date`)))
          .groupBy(Expenses.createdAt)
          .orderBy(Expenses.createdAt);

        // merge income & expenses on YYYY-MM-DD
        const map = new Map();
        for (const r of incomeRows) {
          const key = toKey(r.date);
          map.set(key, { date: key, income: Number(r.total) || 0, expenses: 0 });
        }
        for (const r of expenseRows) {
          const key = toKey(r.date);
          const prev = map.get(key) || { date: key, income: 0, expenses: 0 };
          prev.expenses = Number(r.total) || 0;
          map.set(key, prev);
        }

        setData(fillGaps(startISO, map));
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [user, timeRange, refreshKey]);

  const hasRows = Array.isArray(data) && data.length > 0;
  const hasNonZero =
    hasRows && data.some((d) => Number(d.income || 0) > 0 || Number(d.expenses || 0) > 0);

  // Colors (wired to your ChartContainer CSS vars)
  const chartConfig = {
    income: { label: "Income", color: "#10b981" }, // emerald-500
    expenses: { label: "Expenses", color: "#f43f5e" }, // rose-500
  };

  return (
    <div className="mt-5 shadow-indigo-300 shadow-md rounded-xl">
      <Card className="pt-0">
        {showHeader && (
          <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
            <div className="grid flex-1 gap-1">
              <CardTitle>Income vs. Expenses</CardTitle>
              <CardDescription>Trend for the selected period</CardDescription>
            </div>
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger
                className="hidden w-[160px] rounded-lg sm:ml-auto sm:flex"
                aria-label="Select range"
              >
                <SelectValue placeholder="Last 3 months" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="90d" className="rounded-lg">
                  Last 3 months
                </SelectItem>
                <SelectItem value="30d" className="rounded-lg">
                  Last 30 days
                </SelectItem>
                <SelectItem value="7d" className="rounded-lg">
                  Last 7 days
                </SelectItem>
              </SelectContent>
            </Select>
          </CardHeader>
        )}

        <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
          {loading ? (
            <div className="h-[300px] flex items-center justify-center gap-2 rounded-md bg-gradient-to-br from-indigo-50 to-white">
              <svg className="h-5 w-5 animate-spin text-indigo-600" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                />
              </svg>
              <span className="text-sm text-gray-600">Loading your data…</span>
            </div>
          ) : !hasNonZero ? (
            <div className="h-[300px] flex flex-col items-center justify-center rounded-md border border-dashed border-indigo-200 bg-indigo-50/30 text-center">
              <PieChartIcon className="h-6 w-6 text-indigo-500 mb-2" />
              <p className="text-sm font-medium text-gray-700">No income/expense data yet</p>
              <p className="text-xs text-gray-500 mt-1">Add income or expenses to see your trend.</p>
            </div>
          ) : (
            <ChartContainer config={chartConfig} className="aspect-auto h-[250px] w-full">
              <AreaChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
                <defs>
                  <linearGradient id="fillIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-income)" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="var(--color-income)" stopOpacity={0.1} />
                  </linearGradient>
                  <linearGradient id="fillExpenses" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-expenses)" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="var(--color-expenses)" stopOpacity={0.1} />
                  </linearGradient>
                </defs>

                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  minTickGap={32}
                  padding={{ left: 10, right: 10 }}
                  tickFormatter={(value) =>
                    new Date(value).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })
                  }
                />
                <YAxis hide domain={[0, (max) => max * 1.1]} padding={{ top: 12, bottom: 12 }} />

                <ChartTooltip
                  cursor={false}
                  content={
                    <ChartTooltipContent
                      className="text-[11px] sm:text-[11px]"
                      labelFormatter={(v) =>
                        new Date(v).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })
                      }
                      indicator="dot"
                    />
                  }
                />

                <Area
                  dataKey="expenses"
                  type="monotone"
                  fill="url(#fillExpenses)"
                  stroke="var(--color-expenses)"
                  isAnimationActive={!loading}
                  {...(stacked ? { stackId: "a" } : {})}
                />
                <Area
                  dataKey="income"
                  type="monotone"
                  fill="url(#fillIncome)"
                  stroke="var(--color-income)"
                  isAnimationActive={!loading}
                  {...(stacked ? { stackId: "a" } : {})}
                />

                <ChartLegend
                  content={
                    <ChartLegendContent className="mt-3 text-[13px] sm:text-[16px] [&_li]:gap-2 [&_svg]:h-4 [&_svg]:w-4" />
                  }
                />
              </AreaChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

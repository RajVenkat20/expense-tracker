"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import CardInfo from "./_components/CardInfo";
import { db } from "@/utils/dbConfig";
import { desc, eq, getTableColumns, sql } from "drizzle-orm";
import { Budgets, Expenses, Income } from "@/utils/schema";
import BarChartDashboard from "./_components/BarChartDashboard";
import ExpenseListTable from "./expenses/_components/ExpenseListTable";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import BudgetsDonut from "./_components/BudgetsDonut";
import IncomeVsExpensesArea from "./_components/IncomevsExpensesAreaChart";
import CreateIncomeExpense from "./_components/CreateIncomeExpense";

function Dashboard() {
  const { user } = useUser();
  const email = user?.primaryEmailAddress?.emailAddress ?? "";

  const [budgetList, setBudgetList] = useState([]);
  const [monthlyBudgetList, setMonthlyBudgetList] = useState([]);
  const [monthlyEarnings, setMonthlyEarnings] = useState(0);
  const [isBudgetLoading, setIsBudgetLoading] = useState(true);
  const [isRecentLoading, setIsRecentLoading] = useState(true);
  const [recentExpensesList, setRecentExpensesList] = useState([]);
  const [chartRefreshKey, setChartRefreshKey] = useState(0);

  const getRecentExpenses = useCallback(async () => {
    if (!email) return;
    setIsRecentLoading(true);
    try {
      const result = await db
        .select({
          id: Expenses.id,
          name: Expenses.name,
          amount: Expenses.amount,
          createdAt: Expenses.createdAt,
          // ↓ include category fields from Budgets for the table
          category: Budgets.name,
          categoryId: Budgets.id,
        })
        .from(Expenses)
        .innerJoin(Budgets, eq(Budgets.id, Expenses.budgetId))
        .where(eq(Budgets.createdBy, email))
        .orderBy(desc(Expenses.createdAt))
        .limit(5);

      setRecentExpensesList(result);
    } finally {
      setIsRecentLoading(false);
    }
  }, [email]);

  const getBudgetList = useCallback(async () => {
    if (!email) return;
    setIsBudgetLoading(true);
    try {
      // compute month bounds (ISO strings) for current month
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString();

      // Query budgets and include both all-time and this-month aggregates.
      const result = await db
        .select({
          ...getTableColumns(Budgets),
          totalSpend: sql`sum(${Expenses.amount})`.mapWith(Number),
          totalItem: sql`count(${Expenses.id})`.mapWith(Number),
          // Sum only amounts within the current month
          totalSpendThisMonth: sql`sum(CASE WHEN ${Expenses.createdAt} >= ${monthStart} AND ${Expenses.createdAt} < ${monthEnd} THEN ${Expenses.amount} ELSE 0 END)`.mapWith(Number),
          totalItemThisMonth: sql`sum(CASE WHEN ${Expenses.createdAt} >= ${monthStart} AND ${Expenses.createdAt} < ${monthEnd} THEN 1 ELSE 0 END)`.mapWith(Number),
        })
        .from(Budgets)
        .leftJoin(Expenses, eq(Budgets.id, Expenses.budgetId))
        .where(eq(Budgets.createdBy, email))
        .groupBy(Budgets.id)
        .orderBy(desc(Budgets.id));

      setBudgetList(result);

      // Build a separate list where totalSpend/totalItem reflect the current month only.
      const monthlyList = (result || []).map((b) => ({
        ...b,
        // ensure numeric values and fall back to 0
        totalSpend: Number(b.totalSpendThisMonth || 0),
        totalItem: Number(b.totalItemThisMonth || 0),
      }));
      setMonthlyBudgetList(monthlyList);

      // Also fetch total income (earnings) for the current month
      try {
        const incomeRes = await db
          .select({ total: sql`sum(${Income.amount})`.mapWith(Number) })
          .from(Income)
          .where(sql`${Income.createdAt} >= ${monthStart} AND ${Income.createdAt} < ${monthEnd} AND ${Income.createdBy} = ${email}`);

        const totalIncome = (Array.isArray(incomeRes) && incomeRes[0] && Number(incomeRes[0].total)) || 0;
        setMonthlyEarnings(totalIncome);
      } catch (e) {
        // keep monthlyEarnings as 0 on error
        setMonthlyEarnings(0);
      }
      // also refresh recents after budgets load
      getRecentExpenses();
    } finally {
      setIsBudgetLoading(false);
    }
  }, [email, getRecentExpenses]);

  useEffect(() => {
    if (email) getBudgetList();
  }, [email, getBudgetList]);

  const showViewAllExpenses = !isRecentLoading && recentExpensesList.length > 0;

  return (
    <div className="p-8">
      <CreateIncomeExpense
        onIncomeAdded={() => setChartRefreshKey((k) => k + 1)}
        onExpenseAdded={() => {
          getBudgetList();               // refresh budgets & recents
          setChartRefreshKey((k) => k + 1);
        }}
      />

      {/* Summary cards */}
  {showViewAllExpenses && <CardInfo budgetList={budgetList} monthlyEarnings={monthlyEarnings} />}

      <div className="grid grid-cols-1 lg:grid-cols-2 mt-6 gap-5 items-stretch">
        <div className="h-full">
          <div className="border-2 shadow-md shadow-indigo-300 rounded-lg p-5 h-full min-h-[420px]">
            <BarChartDashboard budgetList={monthlyBudgetList && monthlyBudgetList.length ? monthlyBudgetList : budgetList} isLoading={isBudgetLoading} />
          </div>
        </div>

        <div className="h-full">
          <div className="border-2 shadow-md shadow-indigo-300 rounded-lg p-5 h-full min-h-[420px]">
            <BudgetsDonut
              budgetList={budgetList}
              isLoading={isBudgetLoading}
              refreshData={getBudgetList}
            />
          </div>
        </div>
      </div>

      <IncomeVsExpensesArea refreshKey={chartRefreshKey} />

      {/* Recent Expenses card */}
      <div className="grid mt-5">
        <div className="border-2 shadow-md shadow-indigo-300 rounded-lg p-5 transform transition-all ease-out duration-300 hover:shadow-lg">
          <h2 className="font-bold text-lg mb-4">Recent Expenses</h2>

          <ExpenseListTable
            showCategory   // tell the table to render the Category column
            expensesList={recentExpensesList}
            isLoading={isRecentLoading}
            refreshData={getBudgetList}
          />

          {showViewAllExpenses && (
            <Link href="/dashboard/expenses">
              <Button className="mt-4 w-full bg-indigo-600 hover:bg-indigo-700 hover:shadow-lg hover:scale-[1.02]">
                View All Expenses
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;

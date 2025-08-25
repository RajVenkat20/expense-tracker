"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import CardInfo from "./_components/CardInfo";
import { db } from "@/utils/dbConfig";
import { desc, eq, getTableColumns, sql } from "drizzle-orm";
import { Budgets, Expenses } from "@/utils/schema";
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
        })
        .from(Budgets)
        .rightJoin(Expenses, eq(Budgets.id, Expenses.budgetId))
        .where(eq(Budgets.createdBy, email))
        .orderBy(desc(Expenses.id))
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
      const result = await db
        .select({
          ...getTableColumns(Budgets),
          totalSpend: sql`sum(${Expenses.amount})`.mapWith(Number),
          totalItem: sql`count(${Expenses.id})`.mapWith(Number),
        })
        .from(Budgets)
        .leftJoin(Expenses, eq(Budgets.id, Expenses.budgetId))
        .where(eq(Budgets.createdBy, email))
        .groupBy(Budgets.id)
        .orderBy(desc(Budgets.id));

      setBudgetList(result);
      // Also refresh recents after budgets load
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
        onIncomeAdded={() => {
          // Keep your area chart in sync with income adds
          setChartRefreshKey((k) => k + 1);
        }}
        onExpenseAdded={() => {
          // <<< This is the key bit: refresh parent data after an expense insert
          getBudgetList();               // updates budgets & triggers recent expenses refresh
          setChartRefreshKey((k) => k + 1); // keeps IncomeVsExpensesArea in sync (optional but nice)
        }}
      />

      {/* Summary cards */}
      {showViewAllExpenses && <CardInfo budgetList={budgetList} />}

      <div className="grid grid-cols-1 lg:grid-cols-2 mt-6 gap-5 items-stretch">
        {/* Left: Bar chart */}
        <div className="h-full">
          <div className="border-2 shadow-md shadow-indigo-300 rounded-lg p-5 h-full min-h-[420px]">
            <BarChartDashboard budgetList={budgetList} isLoading={isBudgetLoading} />
          </div>
        </div>

        {/* Right: Donut chart */}
        <div className="h-full">
          <div className="border-2 shadow-md shadow-indigo-300 rounded-lg p-5 h-full min-h-[420px]">
            <h2 className="font-bold text-lg mb-4">Budgets Breakdown</h2>
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
            expensesList={recentExpensesList}
            isLoading={isRecentLoading}
            refreshData={getBudgetList}
          />

          {showViewAllExpenses && (
            <Link href="/dashboard/expenses">
              <Button className="mt-4 cursor-pointer transform transition-all ease-out duration-400 w-full bg-indigo-600 hover:bg-indigo-700 hover:shadow-lg hover:scale-[1.02]">
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

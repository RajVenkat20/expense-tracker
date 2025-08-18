"use client";

import React, { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import CardInfo from "./_components/CardInfo";
import { db } from "@/utils/dbConfig";
import { desc, eq, getTableColumns, sql } from "drizzle-orm";
import { Budgets, Expenses } from "@/utils/schema";
import BarChartDashboard from "./_components/BarChartDashboard";
import BudgetItem from "./budgets/_components/BudgetItem";
import ExpenseListTable from "./expenses/_components/ExpenseListTable";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import BudgetsDonut from "./_components/BudgetsDonut";

function Dashboard() {
  const { user } = useUser();
  const [budgetList, setBudgetList] = useState([]);
  const [expensesList, setExpensesList] = useState([]);
  const [recentExpensesList, setRecentExpensesList] = useState([]);

  useEffect(() => {
    user && getBudgetList();
  }, [user]);

  // Function to get the list of created budgets
  const getBudgetList = async () => {
    const result = await db
      .select({
        ...getTableColumns(Budgets),
        totalSpend: sql`sum(${Expenses.amount})`.mapWith(Number),
        totalItem: sql`count(${Expenses.id})`.mapWith(Number),
      })
      .from(Budgets)
      .leftJoin(Expenses, eq(Budgets.id, Expenses.budgetId))
      .where(eq(Budgets.createdBy, user.primaryEmailAddress.emailAddress))
      .groupBy(Budgets.id)
      .orderBy(desc(Budgets.id));

    setBudgetList(result);
    getRecentExpenses();
  };

  // Function to display 5 recent expenses in the dashboard screen
  const getRecentExpenses = async () => {
    const result = await db
      .select({
        id: Expenses.id,
        name: Expenses.name,
        amount: Expenses.amount,
        createdAt: Expenses.createdAt,
      })
      .from(Budgets)
      .rightJoin(Expenses, eq(Budgets.id, Expenses.budgetId))
      .where(eq(Budgets.createdBy, user.primaryEmailAddress.emailAddress))
      .orderBy(desc(Expenses.id))
      .limit(5);

    setRecentExpensesList(result);
  };

  return (
    <div className="p-8">
      {/* Need to put a carousel of tips and analysis */}
      <CardInfo budgetList={budgetList} />
      <div className="grid grid-cols-1 lg:grid-cols-2 mt-6 gap-5 items-stretch">
        {/* Left: Chart */}
        <div className="h-full">
          <div className="border-2 shadow-md shadow-indigo-300 rounded-lg p-5 h-full min-h-[420px]">
            {/* Ensure your chart/container can grow */}
            <BarChartDashboard budgetList={budgetList} />
          </div>
        </div>

        {/* Right: Recent Expenses */}
        <div className="h-full">
          <div className="border-2 shadow-md shadow-indigo-300 rounded-lg p-5 h-full min-h-[420px]">
            <h2 className="font-bold text-lg mb-4">Budgets Breakdown</h2>

            {/* Make the table area scroll if it exceeds the min height */}
            {/* <div className="max-h-[300px] overflow-auto p-2">
              <ExpenseListTable
                expensesList={recentExpensesList}
                refreshData={() => getBudgetList()}
              />
              
            </div>

            <Link href="/dashboard/expenses">
              <Button className="mt-4 cursor-pointer transform transition-all ease-out duration-400 w-full bg-indigo-600 hover:bg-indigo-700 hover:shadow-lg hover:scale-[1.02]">
                View All Expenses
              </Button>
            </Link> */}
            <BudgetsDonut budgetList={budgetList} />
          </div>
        </div>
      </div>
      <div className="grid mt-5">
          <div className="border-2 shadow-md shadow-indigo-300 rounded-lg p-5 transform transition-all ease-out duration-300 hover:shadow-lg">
            <h2 className="font-bold text-lg mb-4">Recent Expenses</h2>
            {/* Query needs to be modified to only fetch recent 5 transactions */}
            <ExpenseListTable
          expensesList={recentExpensesList}
          refreshData={() => getBudgetList()}/>
            <Link href={'/dashboard/expenses'}>
            <Button className='mt-4 cursor-pointer transform transition-all ease-out duration-400 w-full bg-indigo-600 hover:bg-indigo-700 hover:shadow-lg hover:scale-[1.02]'>View All Expenses</Button>
            </Link>
          </div>
        </div>
    </div>
  );
}

export default Dashboard;

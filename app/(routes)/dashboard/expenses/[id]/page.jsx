"use client";

import { db } from "@/utils/dbConfig";
import { Budgets, Expenses } from "@/utils/schema";
import { useUser } from "@clerk/nextjs";
import { desc, eq, getTableColumns, sql } from "drizzle-orm";
import React, { useEffect, useState } from "react";
import BudgetItem from "../../budgets/_components/BudgetItem";
import AddExpense from "../_components/AddExpense";
import ExpenseListTable from "../_components/ExpenseListTable";

function ExpenseScreen({ params }) {
  const { user } = useUser();
  const [budgetInfo, setBudgetInfo] = useState();
  const [expensesList, setExpensesList] = useState([]);

  useEffect(() => {
    user && getBudgetInfo();
  }, [user]);

  // Function to get information about a specific budget type
  const getBudgetInfo = async () => {
    const result = await db
      .select({
        ...getTableColumns(Budgets),
        totalSpend: sql`sum(${Expenses.amount})`.mapWith(Number),
        totalItem: sql`count(${Expenses.id})`.mapWith(Number),
      })
      .from(Budgets)
      .leftJoin(Expenses, eq(Budgets.id, Expenses.budgetId))
      .where(eq(Budgets.createdBy, user.primaryEmailAddress.emailAddress))
      .where(eq(Budgets.id, params.id))
      .groupBy(Budgets.id);

    // Indexing with 0 since the value fetched is always an array with a single object that matches the id
    setBudgetInfo(result[0]);
    getExpensesList();
  };

  // Function to fetch all the expenses associated with a specific budget type
  const getExpensesList = async () => {
    const result = await db
      .select()
      .from(Expenses)
      .where(eq(Expenses.budgetId, params.id))
      .orderBy(desc(Expenses.id));

    setExpensesList(result)
    console.log(result);
  };

  return (
    <div className="p-10">
      <h2 className="text-3xl font-bold text-shadow-md">My Expenses</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 mt-6 gap-5">
        {/* Adding a pulse animation because when the rendering happens fast, sometimes it takes time to load data ito budgetInfo and to avoid showing errors on the screen, till we have the data, we show the loading icon */}
        {budgetInfo ? (
          <BudgetItem budget={budgetInfo} />
        ) : (
          <div className="h-[150px] w-full bg-slate-200 rounded-lg animate-pulse"></div>
        )}
        <AddExpense
          budgetId={params.id}
          user={user}
          refreshData={() => getBudgetInfo()}
        />
      </div>
      <div className="mt-4">
        <h2 className="font-bold text-lg">Latest Expenses</h2>
        <ExpenseListTable expensesList={expensesList}
        refreshData = {getBudgetInfo()}/>
      </div>
    </div>
  );
}

export default ExpenseScreen;

"use client"

import { db } from "@/utils/dbConfig";
import { Budgets, Expenses } from "@/utils/schema";
import { useUser } from "@clerk/nextjs";
import { eq, getTableColumns, sql } from "drizzle-orm";
import React, { useEffect, useState } from "react";
import BudgetItem from "../../budgets/_components/BudgetItem";
import AddExpense from "../_components/AddExpense";

function ExpenseScreen({ params }) {

    const {user} = useUser();
    const [budgetInfo, setBudgetInfo] = useState();

  useEffect(() => {
    user && getBudgetInfo();
  }, [user]);

  const getBudgetInfo = async() => {
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
          setBudgetInfo(result[0])
  }

  return (
    <div className="p-10">
        <h2 className="text-2xl font-bold">My Expenses</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 mt-6">
          {/* Adding a pulse animation because when the rendering happens fast, sometimes it takes time to load data ito budgetInfo and to avoid showing errors on the screen, till we have the data, we show the loading icon */}
          {budgetInfo ? <BudgetItem
          budget={budgetInfo}/> : <div className="h-[150px] w-full bg-slate-200 rounded-lg animate-pulse"></div>}
          <AddExpense/>
        </div>
    </div>
  );
}

export default ExpenseScreen;

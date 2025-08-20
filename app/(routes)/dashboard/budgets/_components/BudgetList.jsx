"use client";

import React, { useEffect, useState } from "react";
import CreateBudget from "./CreateBudget";
import { db } from "@/utils/dbConfig";
import { desc, getTableColumns, sql } from "drizzle-orm";
import { Budgets, Expenses } from "@/utils/schema";
import { useUser } from "@clerk/nextjs";
import { eq } from "drizzle-orm";
import BudgetItem from "./BudgetItem";

function BudgetList() {
  const { user } = useUser();
  const [budgetList, setBudgetList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    user && getBudgetList();
  }, [user]);

  // Function to get the list of created budgets
  const getBudgetList = async () => {
    setIsLoading(true);
    try {
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
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mt-7">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        <CreateBudget refreshData={() => getBudgetList()} />

        {isLoading ? (
          // Skeletons ONLY while loading
          [1, 2, 3, 4, 5].map((item, idx) => (
            <div
              key={idx}
              className="w-full bg-slate-200 rounded-lg h-[145px] animate-pulse"
            />
          ))
        ) : budgetList.length > 0 ? (
          // Actual budget cards
          budgetList.map((budget, idx) => <BudgetItem key={idx} budget={budget} />)
        ) : (
          // Empty state when there are NO budgets (no skeletons)
          <div className="flex items-center justify-center rounded-lg border border-dashed border-indigo-200 bg-indigo-50/30 p-6 text-center md:col-span-1 lg:col-span-2">
            <div>
              <p className="text-sm font-medium text-gray-700">No budgets yet</p>
              <p className="mt-1 text-xs text-gray-500">
                Create your first budget to get started.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default BudgetList;

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

  // Group budgets by type
  const grouped = React.useMemo(() => {
    const groups = { Weekly: [], Monthly: [], Yearly: [] };
    (budgetList || []).forEach((b) => {
      const type = (b.type || "Monthly").trim();
      if (groups[type]) groups[type].push(b);
    });
    return groups;
  }, [budgetList]);

  const typeOrder = ["Weekly", "Monthly", "Yearly"];
  const typeLabels = {
    Weekly: "Weekly Limits",
    Monthly: "Monthly Limits",
    Yearly: "Yearly Limits",
  };

  return (
    <div className="mt-7">
      {/* CreateBudget full width */}
      <div className="mb-8">
        <CreateBudget refreshData={() => getBudgetList()} />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5].map((item, idx) => (
            <div
              key={idx}
              className="w-full bg-slate-200 rounded-lg h-[145px] animate-pulse"
            />
          ))}
        </div>
      ) : budgetList.length > 0 ? (
        typeOrder.map((type) =>
          grouped[type] && grouped[type].length > 0 ? (
            <div key={type} className="mb-8">
              <h2 className="font-bold text-lg mb-4 text-indigo-700">{typeLabels[type]}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {grouped[type].map((budget, idx) => (
                  <BudgetItem key={budget.id || idx} budget={budget} />
                ))}
              </div>
            </div>
          ) : null
        )
      ) : (
        <div className="flex items-center justify-center rounded-lg border border-dashed border-indigo-200 bg-indigo-50/30 p-6 text-center">
          <div>
            <p className="text-sm font-medium text-gray-700">No expense categories yet</p>
            <p className="mt-1 text-xs text-gray-500">
              Create your first expense category to get started.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default BudgetList;

"use client"

import React, { useEffect, useState } from "react";
import CreateBudget from "./CreateBudget";
import { db } from "@/utils/dbConfig";
import { getTableColumns, sql } from "drizzle-orm";
import { Budgets, Expenses } from "@/utils/schema";
import { useUser } from "@clerk/nextjs";
import { eq } from "drizzle-orm";
import BudgetItem from "./BudgetItem";

function BudgetList() {
  const { user } = useUser();
  const [budgetList, setBudgetList] = useState([]);

  useEffect(() => {
    user && getBudgetList();
  }, [user]);
  // Function to get the list of created budgets
  const getBudgetList = async () => {
    const result = await db
      .select({
        ...getTableColumns(Budgets),
        totalSpend: sql `sum(${Expenses.amount})`.mapWith(Number),
        totalItem: sql `count(${Expenses.id})`.mapWith(Number),
      })
      .from(Budgets)
      .leftJoin(Expenses, eq(Budgets.id, Expenses.budgetId))
      .where(eq(Budgets.createdBy, user.primaryEmailAddress.emailAddress))
      .groupBy(Budgets.id);

      setBudgetList(result);
  };

  return (
    <div className="mt-7">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        <CreateBudget />
        {budgetList.map((budget, idx) => (
          <BudgetItem budget={budget}/>
        ))}
      </div>
    </div>
  );
}

export default BudgetList;

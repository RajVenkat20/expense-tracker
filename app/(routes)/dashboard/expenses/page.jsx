"use client";
import { db } from "@/utils/dbConfig";
import { Budgets, Expenses } from "@/utils/schema";
import { desc, eq } from "drizzle-orm";
import React, { useEffect, useState } from "react";
import ExpenseListTable from "./_components/ExpenseListTable";
import { useUser } from "@clerk/nextjs";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

function ExpensesScreen() {
  const [expensesList, setExpensesList] = useState([]);
  const [isAllLoading, setIsAllLoading] = useState(true); // 👈 loading flag
  const { user } = useUser();
  const route = useRouter();

  useEffect(() => {
    user && getAllExpenses();
  }, [user]);

  // Used to get All expenses belonging to the user
  const getAllExpenses = async () => {
    setIsAllLoading(true); // 👈 start loader
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
        .where(eq(Budgets.createdBy, user?.primaryEmailAddress.emailAddress))
        .orderBy(desc(Expenses.id));

      setExpensesList(result);
    } finally {
      setIsAllLoading(false); // 👈 stop loader
    }
  };

  return (
    <div className="p-10">
      <h2 className="font-bold text-3xl">
        <span className="flex gap-2 items-center">
          <ArrowLeft onClick={() => route.back()} className="cursor-pointer" />
          My Expenses
        </span>
      </h2>

      <div className=" shadow-indigo-300 rounded-lg p-5">
        <ExpenseListTable
          refreshData={getAllExpenses}
          expensesList={expensesList}
          isLoading={isAllLoading}
          emptyTitle="No expenses yet"                 // 👈 custom empty-state text
          emptySubtitle="Add an expense and it’ll appear here."
        />
      </div>
    </div>
  );
}

export default ExpensesScreen;

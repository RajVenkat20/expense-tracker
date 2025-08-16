"use client";

import React, { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import CardInfo from "./_components/CardInfo";
import { db } from "@/utils/dbConfig";
import { desc, eq, getTableColumns, sql } from "drizzle-orm";
import { Budgets, Expenses } from "@/utils/schema";
import BarChartDashboard from "./_components/BarChartDashboard";
import BudgetItem from "./budgets/_components/BudgetItem";

function Dashboard() {
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
        totalSpend: sql`sum(${Expenses.amount})`.mapWith(Number),
        totalItem: sql`count(${Expenses.id})`.mapWith(Number),
      })
      .from(Budgets)
      .leftJoin(Expenses, eq(Budgets.id, Expenses.budgetId))
      .where(eq(Budgets.createdBy, user.primaryEmailAddress.emailAddress))
      .groupBy(Budgets.id)
      .orderBy(desc(Budgets.id));

    setBudgetList(result);
  };

  return (
    <div className="p-8">
      <h2 className="font-bold text-3xl">
        Hi, <strong className="text-indigo-600">{user?.fullName}</strong> ✌️
      </h2>
      <p className="text-gray-500 mt-2">Here's what's happening with your money!</p>
      <CardInfo budgetList={budgetList}/>
      <div className="grid grid-cols-1 md:grid-cols-3 mt-6 gap-5">
        <div className="md:col-span-2">
          <BarChartDashboard budgetList={budgetList}/>
        </div>
        <div className="grid gap-5">
          {/* <h2 className="font-bold text-lg">Budget Types</h2> */}
          {budgetList.map((budget, idx) => (
            <BudgetItem budget={budget} key={idx}/>
          ))}
        </div> 
      </div>
    </div>
  );
}

export default Dashboard;

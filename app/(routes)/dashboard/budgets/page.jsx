"use client";

import React from "react";
import BudgetList from "./_components/BudgetList";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

function Budget() {
  const route = useRouter();
  return (
    <div className="p-10">
      <h2 className="font-bold text-3xl text-shadow-md">
        <span className="flex gap-2 items-center">
          <ArrowLeft onClick={() => route.back()} className="cursor-pointer" />
          My Expense Categories
        </span>{" "}
      </h2>
      <BudgetList />
    </div>
  );
}

export default Budget;

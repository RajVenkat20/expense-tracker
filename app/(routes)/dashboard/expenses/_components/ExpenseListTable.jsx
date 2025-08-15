import { db } from "@/utils/dbConfig";
import { Expenses } from "@/utils/schema";
import { eq } from "drizzle-orm";
import { Trash2 } from "lucide-react";
import React from "react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

function ExpenseListTable({ expensesList, refreshData }) {
  const deleteExpense = async (expense) => {
    const result = await db
      .delete(Expenses)
      .where(eq(Expenses.id, expense.id))
      .returning();

    if (result) {
      toast("Expense Deleted!");
      refreshData();
    }
  };

  return (
    <div className="mt-3">
      <div className="font-bold grid grid-cols-4 bg-slate-200 p-4 rounded-lg">
        <h2>Name</h2>
        <h2>Amount</h2>
        <h2>Date</h2>
        <h2>Action</h2>
      </div>
      {expensesList.map((expenses, idx) => (
        <div
          key={idx}
          className="mt-4 grid grid-cols-4 bg-slate-50 p-4 rounded-lg hover:bg-slate-100 transform transition-all duration-400 hover:scale-102 ease-out hover:shadow-md"
        >
          <h2>{expenses.name}</h2>
          <h2 className="text-indigo-600 font-bold">${expenses.amount}</h2>
          <h2>{expenses.createdAt}</h2>
          <h2 className="ml-3 cursor-pointer">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Trash2
                  className="text-red-600"
                />
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure you want to delete the expense?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the expense from the server.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction className="bg-red-600" onClick={() => deleteExpense(expenses)}>Continue</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </h2>
        </div>
      ))}
    </div>
  );
}

export default ExpenseListTable;

"use client";
import { db } from "@/utils/dbConfig";
import { Expenses } from "@/utils/schema";
import { eq } from "drizzle-orm";
import { Loader2, Trash2, ReceiptText } from "lucide-react";
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

/**
 * Reusable table for showing expenses.
 *
 * Props:
 * - expensesList: array of rows. If showCategory=true, try to read category from
 *   row.category OR row.budgetName OR row.budget?.name.
 * - isLoading: boolean
 * - refreshData: fn
 * - emptyTitle, emptySubtitle: strings
 * - showCategory: boolean (default false) -> toggles Category column
 */
function ExpenseListTable({
  expensesList = [],
  isLoading = false,
  refreshData,
  emptyTitle = "No recent expenses",
  emptySubtitle = "Add an expense and it’ll appear here.",
  showCategory = false,
}) {
  const deleteExpense = async (expense) => {
    const result = await db
      .delete(Expenses)
      .where(eq(Expenses.id, expense.id))
      .returning();
    if (result) {
      toast.success("Expense Deleted!", {
        className: "text-green-600 font-semibold",
      });
      refreshData?.();
    }
  };

  const hasRows = Array.isArray(expensesList) && expensesList.length > 0;
  const showHeader = !isLoading && hasRows;

  // 4 columns normally; 5 when Category is shown
  const gridColsClass = showCategory ? "grid-cols-5" : "grid-cols-4";

  return (
    <div className="mt-3">
      {showHeader && (
        <div
          className={`font-bold grid ${gridColsClass} bg-slate-200 p-4 rounded-lg text-center`}
        >
          <h2>Name</h2>
          {showCategory && <h2>Category</h2>}
          <h2>Amount</h2>
          <h2>Date</h2>
          <h2>Action</h2>
        </div>
      )}

      {isLoading ? (
        <div className="mt-4 space-y-3">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="h-10 w-full rounded-lg bg-slate-100 animate-pulse"
            />
          ))}
          <div className="mt-2 flex items-center gap-2 text-gray-600">
            <Loader2 className="h-4 w-4 animate-spin text-indigo-600" />
            <span className="text-xs">Loading expenses…</span>
          </div>
        </div>
      ) : !hasRows ? (
        <div className="mt-4 flex flex-col items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50 py-10 text-center">
          <ReceiptText className="h-6 w-6 text-indigo-500 mb-2" />
          <p className="text-sm font-medium text-gray-700">{emptyTitle}</p>
          <p className="text-xs text-gray-500 mt-1">{emptySubtitle}</p>
        </div>
      ) : (
        expensesList.map((row, idx) => {
          const amt = Number(row.amount ?? 0);
          const amountClass =
            amt < 50
              ? "text-green-600"
              : amt <= 150
              ? "text-orange-500"
              : "text-red-600 animate-pulse text-shadow-lg";

          // Try multiple keys so the component works with different queries
          const categoryText =
            row.category ??
            row.budgetName ??
            (row.budget && row.budget.name) ??
            "—";

          return (
            <div
              key={idx}
              className={`mt-4 grid ${gridColsClass} bg-slate-50 p-4 rounded-lg hover:bg-slate-100 transform transition-all duration-400 ease-out hover:shadow-md items-center text-center`}
            >
              <h2 className="truncate">{row.name}</h2>

              {showCategory && (
                <h2 className="truncate text-gray-700">{categoryText}</h2>
              )}

              <h2 className={`font-bold ${amountClass}`}>
                ${amt.toLocaleString(undefined, { maximumFractionDigits: 2 })}
              </h2>

              <h2>{row.createdAt}</h2>

              <h2 className="ml-3">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <button aria-label="Delete expense">
                      <Trash2 className="text-red-600 cursor-pointer" />
                    </button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete this expense?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently
                        delete the expense from the server.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-red-600"
                        onClick={() => deleteExpense(row)}
                      >
                        Continue
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </h2>
            </div>
          );
        })
      )}
    </div>
  );
}

export default ExpenseListTable;

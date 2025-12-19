"use client";

import { db } from "@/utils/dbConfig";
import { Budgets, Expenses } from "@/utils/schema";
import { useUser } from "@clerk/nextjs";
import { and, desc, eq, getTableColumns, sql } from "drizzle-orm";
import React, { useEffect, useMemo, useState } from "react";
import BudgetItem from "../../budgets/_components/BudgetItem";
import AddExpense from "../_components/AddExpense";
import ExpenseListTable from "../_components/ExpenseListTable";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Trash2 } from "lucide-react";

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
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import EditBudget from "../_components/EditBudget";

function ExpenseScreen({ params }) {
  const { user } = useUser();
  const [budgetInfo, setBudgetInfo] = useState();
  const [expensesList, setExpensesList] = useState([]);
  const route = useRouter();

  // get the id from params (passed in by parent/page)
  const id = params?.id;
  const budgetId = Number(id);

  useEffect(() => {
    if (user && id) getBudgetInfo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, id]);

  // Function to get information about a specific budget type
  const getBudgetInfo = async () => {
    const result = await db
      .select({
        ...getTableColumns(Budgets),
        totalSpend: sql`COALESCE(sum(${Expenses.amount}), 0)`.mapWith(Number),
        totalItem: sql`count(${Expenses.id})`.mapWith(Number),
      })
      .from(Budgets)
      .leftJoin(Expenses, eq(Budgets.id, Expenses.budgetId))
      .where(
        and(
          eq(Budgets.createdBy, user.primaryEmailAddress.emailAddress),
          eq(Budgets.id, budgetId)
        )
      )
      .groupBy(Budgets.id);

    setBudgetInfo(result[0]);
    getExpensesList();
  };

  // Function to fetch all the expenses associated with a specific budget type
  const getExpensesList = async () => {
    const result = await db
      .select()
      .from(Expenses)
      .where(eq(Expenses.budgetId, budgetId))
      .orderBy(desc(Expenses.id))
      .limit(5);

    setExpensesList(result);
  };

  // Function to delete the budget type along with all the expenses associated with it.
  const deleteBudgetType = async () => {
    const deleteExpenseResult = await db
      .delete(Expenses)
      .where(eq(Expenses.budgetId, budgetId))
      .returning();

    if (deleteExpenseResult) {
      await db.delete(Budgets).where(eq(Budgets.id, budgetId)).returning();
    }

    toast("Budget Type Deleted");
    route.replace("/dashboard/budgets");
  };

  // ---------- fun/flashy message logic ----------
  const vibe = useMemo(() => {
    if (!budgetInfo) return null;

    const total = Number(budgetInfo.amount ?? 0);
    const spent = Number(budgetInfo.totalSpend ?? 0);
    const rawRemaining = total - spent; // may be negative if exceeded
    const remainingPct = total > 0 ? (rawRemaining / total) * 100 : 0;

    // Clamp for display
    const pctDisplay = Math.max(0, Math.min(100, Math.round(remainingPct)));

    const fmt = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    });

    // Pick one of 4 messages.
    // Your ranges:
    // >75%  -> Message 1
    // 50–75 -> Message 2
    // 25–50 -> Message 3
    // <=25% (incl. 0 or exceeded) -> Message 4
    let title = "";
    let sub = "";
    let tone = "good";

    if (remainingPct > 75) {
      tone = "good";
      title = `🎉 Budget boss! ${pctDisplay}% left.`;
      sub = `Nice! You've spent ${fmt.format(
        spent
      )} and still have ${fmt.format(Math.max(rawRemaining, 0))} to play with.`;
    } else if (remainingPct > 50) {
      tone = "okay";
      title = `😎 Smooth sailing — ${pctDisplay}% remains.`;
      sub = `Keeping a steady pace. ${fmt.format(spent)} spent, ${fmt.format(
        Math.max(rawRemaining, 0)
      )} remaining.`;
    } else if (remainingPct > 25) {
      tone = "caution";
      title = `🧭 Heads up — ${pctDisplay}% left.`;
      sub = `You're halfway through your budget. Maybe skip a small splurge this week.`;
    } else {
      tone = "danger";
      if (rawRemaining <= 0) {
        title = `🚨 Over budget by ${fmt.format(Math.abs(rawRemaining))}!`;
        sub = `Time for a quick audit — trim a couple of non-essentials to get back on track.`;
      } else {
        title = `⚠️ Tight stretch — only ${pctDisplay}% left.`;
        sub = `Consider a mini “no-spend” challenge until the next reset.`;
      }
    }

    // styles per tone
    const toneStyles = {
      good: "from-emerald-500 via-teal-500 to-indigo-500 ring-emerald-300/50 shadow-emerald-500/30",
      okay: "from-indigo-500 via-purple-500 to-pink-500 ring-indigo-300/50 shadow-indigo-500/30",
      caution:
        "from-amber-500 via-orange-500 to-rose-500 ring-amber-300/50 shadow-amber-500/30",
      danger:
        "from-rose-600 via-red-600 to-fuchsia-600 ring-rose-300/50 shadow-rose-500/30",
    };

    return {
      title,
      sub,
      ringShadow: toneStyles[tone],
      spent: fmt.format(spent),
      remaining:
        rawRemaining <= 0
          ? fmt.format(0)
          : fmt.format(Math.max(rawRemaining, 0)),
    };
  }, [budgetInfo]);

  return (
    <div className="p-10">
      <h2 className="text-3xl font-bold text-shadow-md flex justify-between items-center">
        <span className="flex gap-2 items-center">
          <ArrowLeft onClick={() => route.back()} className="cursor-pointer hover:text-indigo-600 transform transition-all duration-400 hover:scale-[1.20]" />
          <span>
            My Expenses for{" "}
            {budgetInfo?.name && (
              <>
                <span className="text-indigo-600">{budgetInfo.name}</span>
              </>
            )}
          </span>
        </span>
        <div className="flex gap-3 items-center">
          <EditBudget budgetInfo={budgetInfo} refreshData={getBudgetInfo} />
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="destructive"
                className="flex gap-2 transform transition-all ease-out duration-400 hover:scale-103 hover:shadow-lg"
              >
                <Trash2 /> Delete Category
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  Are you sure you want to delete this category?
                </AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the
                  category, all the expenses associated with it, and remove
                  your data from the server.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={deleteBudgetType}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 mt-6 gap-5 items-stretch">
        {/* LEFT COLUMN = one tall cell that stacks both cards */}
        <div className="flex flex-col gap-5 h-full">
          {/* Vibe card lives under BudgetItem in the SAME column */}
          {vibe && (
            <div
              className={`relative overflow-hidden rounded-lg p-5 text-white shadow-xl ring-1 bg-gradient-to-r ${vibe.ringShadow}`}
            >
              <div className="pointer-events-none absolute inset-0 opacity-20 animate-pulse bg-[radial-gradient(120px_80px_at_20%_10%,white,transparent),radial-gradient(120px_80px_at_80%_90%,white,transparent)]" />
              <div className="relative">
                {/* <p className="text-xs uppercase opacity-90">Budget vibe check</p> */}
                <h3 className="mt-1 text-2xl font-extrabold drop-shadow">
                  {vibe.title}
                </h3>
                <p className="mt-2 text-sm opacity-95">{vibe.sub}</p>
              </div>
            </div>
          )}
          {budgetInfo ? (
            <BudgetItem budget={budgetInfo} />
          ) : (
            <div className="h-[150px] w-full bg-slate-200 rounded-lg animate-pulse" />
          )}
        </div>

        {/* RIGHT COLUMN = single tall cell (force child to fill) */}
        <div className="h-full [&>*]:h-full">
          <AddExpense
            budgetId={budgetId}
            user={user}
            refreshData={getBudgetInfo}
          />
        </div>
      </div>

      <div className="mt-4 border p-5 shadow-md rounded-lg shadow-indigo-300">
        <h2 className="font-bold text-lg">Latest Expenses</h2>
        <ExpenseListTable
          expensesList={expensesList}
          refreshData={getBudgetInfo}
        />
        <Link href="/dashboard/expenses">
          <Button className="mt-4 cursor-pointer transform transition-all ease-out duration-400 w-full bg-indigo-600 hover:bg-indigo-700 hover:shadow-lg hover:scale-[1.02]">
            View All Expenses
          </Button>
        </Link>
      </div>
    </div>
  );
}

export default ExpenseScreen;

"use client";

import React, { useEffect, useMemo, useState } from "react";
import { TrendingDown, TrendingUp, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";

import { db } from "@/utils/dbConfig";
import { Budgets, Expenses, Income } from "@/utils/schema";
import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";
import { eq } from "drizzle-orm";
import Link from "next/link";

function toISODate(d = new Date()) {
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export default function CreateIncomeExpense({ onIncomeAdded, onExpenseAdded }) {
  const { user } = useUser();
  const email = user?.primaryEmailAddress?.emailAddress ?? "";

  /* ---------------- Income ---------------- */
  const [incomeOpen, setIncomeOpen] = useState(false);
  const [incomeForm, setIncomeForm] = useState({
    name: "",
    amount: "",
    description: "",
    type: "salary", // maps to Income.source
    date: toISODate(),
  });

  const resetIncome = () =>
    setIncomeForm({ name: "", amount: "", description: "", type: "salary", date: toISODate() });

  const handleIncomeOpenChange = (next) => {
    setIncomeOpen(next);
    if (!next) resetIncome();
  };

  const submitIncome = async (e) => {
    e.preventDefault();
    if (!email) return;

    const amountNum = parseFloat(String(incomeForm.amount).trim());
    if (!Number.isFinite(amountNum) || amountNum <= 0) {
      toast.error("Please enter a valid income amount.");
      return;
    }

    try {
      await db.insert(Income).values({
        source: incomeForm.type,
        description: incomeForm.description || incomeForm.name || null,
        amount: amountNum,
        createdAt: incomeForm.date, // Postgres DATE accepts yyyy-mm-dd
        createdBy: email,
      });

      onIncomeAdded?.();
      toast.success("Income added successfully!");
      setIncomeOpen(false);
      resetIncome();
    } catch (err) {
      console.error(err);
      toast.error("Failed to add income. Please try again.");
    }
  };

  /* ---------------- Expense ---------------- */
  const [expenseOpen, setExpenseOpen] = useState(false);
  const [expenseForm, setExpenseForm] = useState({
    name: "",
    amount: "",
    description: "",
    budgetId: "", // use FK to Budgets.id
    date: toISODate(),
  });

  const resetExpense = () =>
    setExpenseForm({ name: "", amount: "", description: "", budgetId: "", date: toISODate() });

  const handleExpenseOpenChange = (next) => {
    setExpenseOpen(next);
    if (!next) resetExpense();
  };

  // Budgets dropdown (only those created by the current user)
  const [budgets, setBudgets] = useState([]);
  const [loadingBudgets, setLoadingBudgets] = useState(false);
  const hasBudgets = useMemo(() => budgets.length > 0, [budgets]);

  useEffect(() => {
    if (!expenseOpen || !email) return;

    (async () => {
      try {
        setLoadingBudgets(true);
        const rows = await db.select().from(Budgets).where(eq(Budgets.createdBy, email));
        setBudgets(rows || []);
      } catch (err) {
        console.error(err);
        toast.error("Could not load your budgets.");
      } finally {
        setLoadingBudgets(false);
      }
    })();
  }, [expenseOpen, email]);

  const submitExpense = async (e) => {
    e.preventDefault();
    if (!email) return;

    if (!hasBudgets) {
      toast.error("Create a budget first, then add an expense.");
      return;
    }

    const amountNum = parseFloat(String(expenseForm.amount).trim());
    if (!Number.isFinite(amountNum) || amountNum <= 0) {
      toast.error("Please enter a valid expense amount.");
      return;
    }

    if (!expenseForm.budgetId) {
      toast.error("Please choose a budget category.");
      return;
    }

    try {
      await db.insert(Expenses).values({
        name: expenseForm.name,
        amount: amountNum,
        budgetId: Number(expenseForm.budgetId),
        createdAt: expenseForm.date, // Postgres DATE accepts yyyy-mm-dd
        createdBy: email,
      });

      onExpenseAdded?.();
      toast.success("Expense added successfully!");
      setExpenseOpen(false);
      resetExpense();
    } catch (err) {
      console.error(err);
      toast.error("Failed to add expense. Please try again.");
    }
  };

  return (
    <div className="mt-7 grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* ---------- Add Income ---------- */}
      <Dialog open={incomeOpen} onOpenChange={handleIncomeOpenChange}>
        <DialogTrigger asChild>
          <div className="p-7 rounded-lg flex items-center justify-between border-2 shadow-md shadow-indigo-300 transform transition-all duration-400 hover:scale-104 hover:shadow-lg ease-out cursor-pointer hover:border-indigo-100 hover:shadow-green-300">
            <div>
              <h2 className="text-xl font-bold">Add Income</h2>
              <p className="text-xs text-gray-500 mt-1">Record a new income entry</p>
            </div>
            <TrendingUp className="bg-emerald-600 p-3 h-12 w-12 rounded-full text-white shadow-lg" />
          </div>
        </DialogTrigger>

        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Income</DialogTitle>
            <DialogDescription>Fill in the details and submit.</DialogDescription>
          </DialogHeader>

          <form onSubmit={submitIncome} className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="text-sm text-gray-700">Income Name</label>
              <Input
                placeholder="e.g. July Salary"
                value={incomeForm.name}
                onChange={(e) => setIncomeForm((f) => ({ ...f, name: e.target.value }))}
              />
            </div>

            <div>
              <label className="text-sm text-gray-700">Amount</label>
              <Input
                type="number"
                inputMode="decimal"
                min="0"
                step="0.01"
                placeholder="e.g. 2500"
                value={incomeForm.amount}
                onChange={(e) => setIncomeForm((f) => ({ ...f, amount: e.target.value }))}
              />
            </div>

            <div>
              <label className="text-sm text-gray-700">Type</label>
              <select
                className="h-9 w-full rounded-md border border-input px-3 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-200 focus-visible:ring-offset-2"
                value={incomeForm.type}
                onChange={(e) => setIncomeForm((f) => ({ ...f, type: e.target.value }))}
              >
                <option value="salary">Salary</option>
                <option value="bonus">Bonus</option>
                <option value="freelance">Freelance</option>
                <option value="investment">Investment</option>
                <option value="gift">Gift</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="text-sm text-gray-700">Date</label>
              <Input
                type="date"
                value={incomeForm.date}
                onChange={(e) => setIncomeForm((f) => ({ ...f, date: e.target.value }))}
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-sm text-gray-700">Description</label>
              <textarea
                rows={3}
                placeholder="Optional notes"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-200 focus-visible:ring-offset-2"
                value={incomeForm.description}
                onChange={(e) => setIncomeForm((f) => ({ ...f, description: e.target.value }))}
              />
            </div>

            <DialogFooter className="sm:col-span-2 mt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIncomeOpen(false)}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-700 w-full sm:w-auto"
                disabled={!incomeForm.name || !incomeForm.amount || !incomeForm.date}
              >
                Add
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ---------- Add Expense ---------- */}
      <Dialog open={expenseOpen} onOpenChange={handleExpenseOpenChange}>
        <DialogTrigger asChild>
          <div className="p-7 rounded-lg flex items-center justify-between border-2 shadow-md shadow-indigo-300 transform transition-all duration-400 hover:scale-104 hover:shadow-lg ease-out cursor-pointer hover:border-indigo-100 hover:shadow-red-300">
            <div>
              <h2 className="text-xl font-bold">Add Expense</h2>
              <p className="text-xs text-gray-500 mt-1">Record a new expense</p>
            </div>
            <TrendingDown className="bg-rose-600 p-3 h-12 w-12 rounded-full text-white shadow-lg" />
          </div>
        </DialogTrigger>

        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Expense</DialogTitle>
            <DialogDescription>Fill in the details and submit.</DialogDescription>
          </DialogHeader>

          {/* If no budgets, show a helpful callout */}
          {!loadingBudgets && !hasBudgets && (
            <div className="mb-3 flex items-start gap-3 rounded-md border p-3 bg-amber-50">
              <Info className="mt-0.5 h-5 w-5 text-amber-700" />
              <div className="text-sm">
                <p className="font-medium text-amber-800">No budgets found</p>
                <p className="text-amber-800/90">
                  Create a budget category first, then add an expense.
                </p>
                <div className="mt-2">
                  <Link href="/dashboard/budgets">
                    <Button size="sm" variant="outline">Create Budget</Button>
                  </Link>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={submitExpense} className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Name */}
            <div className="sm:col-span-2">
              <label className="text-sm text-gray-700">Expense Name</label>
              <Input
                placeholder="e.g. Groceries"
                value={expenseForm.name}
                onChange={(e) => setExpenseForm((f) => ({ ...f, name: e.target.value }))}
                disabled={!hasBudgets}
              />
            </div>

            {/* Amount */}
            <div>
              <label className="text-sm text-gray-700">Amount</label>
              <Input
                type="number"
                inputMode="decimal"
                min="0"
                step="0.01"
                placeholder="e.g. 45.90"
                value={expenseForm.amount}
                onChange={(e) => setExpenseForm((f) => ({ ...f, amount: e.target.value }))}
                disabled={!hasBudgets}
              />
            </div>

            {/* Category (Budgets) */}
            <div>
              <label className="text-sm text-gray-700">Category</label>
              <select
                className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-200 focus-visible:ring-offset-2 disabled:opacity-60"
                value={expenseForm.budgetId}
                onChange={(e) => setExpenseForm((f) => ({ ...f, budgetId: e.target.value }))}
                disabled={!hasBudgets || loadingBudgets}
              >
                <option value="" disabled>
                  {loadingBudgets ? "Loading..." : "Select a budget"}
                </option>
                {budgets.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Date */}
            <div>
              <label className="text-sm text-gray-700">Date</label>
              <Input
                type="date"
                value={expenseForm.date}
                onChange={(e) => setExpenseForm((f) => ({ ...f, date: e.target.value }))}
                disabled={!hasBudgets}
              />
            </div>

            {/* Description (UI-only; Expenses table has no description column) */}
            <div className="sm:col-span-2">
              <label className="text-sm text-gray-700">Description</label>
              <textarea
                rows={3}
                placeholder="Optional notes"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-200 focus-visible:ring-offset-2"
                value={expenseForm.description}
                onChange={(e) => setExpenseForm((f) => ({ ...f, description: e.target.value }))}
                disabled={!hasBudgets}
              />
            </div>

            <DialogFooter className="sm:col-span-2 mt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setExpenseOpen(false)}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-rose-600 hover:bg-rose-700 w-full sm:w-auto"
                disabled={
                  !hasBudgets ||
                  !expenseForm.name ||
                  !expenseForm.amount ||
                  !expenseForm.date ||
                  !expenseForm.budgetId
                }
              >
                Add
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

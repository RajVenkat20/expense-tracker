"use client";

import { db } from "@/utils/dbConfig";
import { Budgets, Expenses } from "@/utils/schema";
import { desc, eq, sql } from "drizzle-orm";
import React, { useEffect, useState } from "react";
import ExpenseListTable from "./_components/ExpenseListTable";
import { useUser } from "@clerk/nextjs";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const PAGE_SIZE = 10;

function ExpensesScreen() {
  const [expensesList, setExpensesList] = useState([]);
  const [isAllLoading, setIsAllLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // --- SEARCH/FILTER UI STATE (UI only for now) ---
  const [query, setQuery] = useState("");
  const [amountMin, setAmountMin] = useState("");
  const [amountMax, setAmountMax] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const { user } = useUser();
  const route = useRouter();

  useEffect(() => {
    if (user) getAllExpenses(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Fetch a page of expenses + total count
  const getAllExpenses = async (pageArg = 1) => {
    setIsAllLoading(true);
    try {
      const email = user?.primaryEmailAddress?.emailAddress ?? "";
      const offset = (pageArg - 1) * PAGE_SIZE;

      const [rows, countRows] = await Promise.all([
        db
          .select({
            id: Expenses.id,
            name: Expenses.name,
            amount: Expenses.amount,
            createdAt: Expenses.createdAt,
          })
          .from(Expenses)
          .innerJoin(Budgets, eq(Budgets.id, Expenses.budgetId)) // query from Expenses
          .where(eq(Budgets.createdBy, email))
          .orderBy(desc(Expenses.id))
          .limit(PAGE_SIZE)
          .offset(offset),

        db
          .select({ count: sql`count(*)` }) // JSX-safe; coerce to Number below
          .from(Expenses)
          .innerJoin(Budgets, eq(Budgets.id, Expenses.budgetId))
          .where(eq(Budgets.createdBy, email)),
      ]);

      const total = Number(countRows?.[0]?.count ?? 0);

      // If current page is out of range (e.g., after deletions), jump to last valid page
      const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
      if (pageArg > totalPages && total > 0) {
        return getAllExpenses(totalPages);
      }

      setExpensesList(rows);
      setTotalCount(total);
      setPage(pageArg);
    } finally {
      setIsAllLoading(false);
    }
  };

  // --- UI handlers (no backend calls yet) ---
  const handleSearch = (e) => {
    e?.preventDefault();
    console.log("SEARCH CRITERIA ->", {
      query,
      amountMin,
      amountMax,
      dateFrom,
      dateTo,
    });
    // Later: call getAllExpenses(1) and apply these in your DB WHERE clause.
  };

  const handleClear = () => {
    setQuery("");
    setAmountMin("");
    setAmountMax("");
    setDateFrom("");
    setDateTo("");
    console.log("SEARCH CRITERIA CLEARED");
  };

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const canPrev = !isAllLoading && page > 1;
  const canNext = !isAllLoading && page < totalPages;
  const start = totalCount === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const end = totalCount === 0 ? 0 : Math.min(page * PAGE_SIZE, totalCount);

  return (
    <div className="p-10">
      <h2 className="font-bold text-3xl">
        <span className="flex gap-2 items-center">
          <ArrowLeft onClick={() => route.back()} className="cursor-pointer" />
          My Expenses
        </span>
      </h2>

      {/* SEARCH AREA */}
      <form
        onSubmit={handleSearch}
        className="mt-5 rounded-lg border p-4 shadow-sm"
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-6">
          {/* Name search */}
          <div className="lg:col-span-2">
            <label
              htmlFor="search-query"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Search by name
            </label>
            <Input
              id="search-query"
              placeholder="e.g., Coffee, Uber..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          {/* Amount Min */}
          <div>
            <label
              htmlFor="amount-min"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Amount (min)
            </label>
            <Input
              id="amount-min"
              type="number"
              inputMode="decimal"
              placeholder="e.g., 0"
              value={amountMin}
              onChange={(e) => setAmountMin(e.target.value)}
              min="0"
            />
          </div>

          {/* Amount Max */}
          <div>
            <label
              htmlFor="amount-max"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Amount (max)
            </label>
            <Input
              id="amount-max"
              type="number"
              inputMode="decimal"
              placeholder="e.g., 100"
              value={amountMax}
              onChange={(e) => setAmountMax(e.target.value)}
              min="0"
            />
          </div>

          {/* Date From */}
          <div>
            <label
              htmlFor="date-from"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Date from
            </label>
            <Input
              id="date-from"
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
            />
          </div>

          {/* Date To */}
          <div>
            <label
              htmlFor="date-to"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Date to
            </label>
            <Input
              id="date-to"
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={handleClear}
            className="ease-out transform transition-all duration-300 hover:bg-gray-100 hover:scale-[1.02]"
          >
            Clear
          </Button>
          <Button
            type="submit"
            className="gap-1 ease-out transform transition-all duration-300 hover:scale-[1.03] hover:shadow-lg hover:shadow-indigo-300"
          >
            Search
          </Button>
        </div>
      </form>

      <div className="mt-5 border-2 shadow-md shadow-indigo-300 rounded-lg p-5">
        <ExpenseListTable
          refreshData={() => getAllExpenses(page)} // keep current page after deletes
          expensesList={expensesList}
          isLoading={isAllLoading}
          emptyTitle="No expenses yet"
          emptySubtitle="Add an expense and it'll appear here."
        />

        {/* Pagination */}
        {totalCount > 0 && (
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-gray-500">
              Showing{" "}
              <span className="font-medium text-indigo-600">{start}</span>–
              <span className="font-medium text-indigo-600">{end}</span> of{" "}
              <span className="font-medium text-indigo-600">{totalCount}</span>
            </p>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => getAllExpenses(page - 1)}
                disabled={!canPrev}
                className="gap-1 text-indigo-600 ease-out transform transition-all duration-400 hover:bg-blue-100 hover:scale-[1.05] hover:shadow-lg hover:shadow-indigo-300"
              >
                <ChevronLeft className="h-4 w-4 text-indigo-600" />
                Previous
              </Button>

              <span className="text-sm text-gray-600 mx-2">
                Page <span className="font-medium text-indigo-600">{page}</span>{" "}
                of{" "}
                <span className="font-medium text-indigo-600">
                  {totalPages}
                </span>
              </span>

              <Button
                variant="outline"
                size="sm"
                onClick={() => getAllExpenses(page + 1)}
                disabled={!canNext}
                className="gap-1 text-indigo-600 ease-out transform transition-all duration-400 hover:bg-blue-100 hover:scale-[1.05] hover:shadow-lg hover:shadow-indigo-300"
              >
                Next
                <ChevronRight className="h-4 w-4 text-indigo-600" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ExpensesScreen;

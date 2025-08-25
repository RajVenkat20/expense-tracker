"use client";

import { db } from "@/utils/dbConfig";
import { Budgets, Expenses } from "@/utils/schema";
import {
  and,
  between,
  desc,
  eq,
  gte,
  ilike,
  lte,
  sql,
} from "drizzle-orm";
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

  // --- SEARCH/FILTER UI STATE ---
  const [query, setQuery] = useState("");
  const [amountMin, setAmountMin] = useState("");
  const [amountMax, setAmountMax] = useState("");
  const [dateFrom, setDateFrom] = useState(""); // expected YYYY-MM-DD
  const [dateTo, setDateTo] = useState("");     // expected YYYY-MM-DD

  // Persisted criteria to reuse across pagination
  const [searchCriteria, setSearchCriteria] = useState({
    query: "",
    amountMin: "",
    amountMax: "",
    dateFrom: "",
    dateTo: "",
  });

  const { user } = useUser();
  const route = useRouter();

  useEffect(() => {
    if (user) {
      // initial load with empty criteria
      getAllExpenses(1, searchCriteria);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Build a WHERE expression based on criteria
  const buildWhere = (email, criteria) => {
    const conds = [eq(Budgets.createdBy, email)];

    // name contains (case-insensitive)
    if (criteria.query && criteria.query.trim() !== "") {
      // ilike expects a pattern with % wildcards
      conds.push(ilike(Expenses.name, `%${criteria.query.trim()}%`));
    }

    // amount filters
    const minVal = criteria.amountMin !== "" ? Number(criteria.amountMin) : null;
    const maxVal = criteria.amountMax !== "" ? Number(criteria.amountMax) : null;

    if (minVal != null && !Number.isNaN(minVal) &&
        maxVal != null && !Number.isNaN(maxVal)) {
      conds.push(between(Expenses.amount, minVal, maxVal));
    } else if (minVal != null && !Number.isNaN(minVal)) {
      conds.push(gte(Expenses.amount, minVal));
    } else if (maxVal != null && !Number.isNaN(maxVal)) {
      conds.push(lte(Expenses.amount, maxVal));
    }

    // date range filters (works best if createdAt is DATE or ISO string)
    const from = criteria.dateFrom && criteria.dateFrom.trim() !== "" ? criteria.dateFrom : null;
    const to = criteria.dateTo && criteria.dateTo.trim() !== "" ? criteria.dateTo : null;

    if (from && to) {
      conds.push(between(Expenses.createdAt, from, to));
    } else if (from) {
      conds.push(gte(Expenses.createdAt, from));
    } else if (to) {
      conds.push(lte(Expenses.createdAt, to));
    }

    return and(...conds);
  };

  // Fetch a page of expenses + total count (with filters)
  const getAllExpenses = async (pageArg = 1, criteria = searchCriteria) => {
    setIsAllLoading(true);
    try {
      const email = user?.primaryEmailAddress?.emailAddress ?? "";
      const offset = (pageArg - 1) * PAGE_SIZE;
      const whereExpr = buildWhere(email, criteria);

      // rows
      const rowsPromise = db
        .select({
          id: Expenses.id,
          name: Expenses.name,
          amount: Expenses.amount,
          createdAt: Expenses.createdAt,
        })
        .from(Expenses)
        .innerJoin(Budgets, eq(Budgets.id, Expenses.budgetId))
        .where(whereExpr)
        .orderBy(desc(Expenses.id))
        .limit(PAGE_SIZE)
        .offset(offset);

      // total count
      const countPromise = db
        .select({ count: sql`count(*)` })
        .from(Expenses)
        .innerJoin(Budgets, eq(Budgets.id, Expenses.budgetId))
        .where(whereExpr);

      const [rows, countRows] = await Promise.all([rowsPromise, countPromise]);
      const total = Number(countRows?.[0]?.count ?? 0);

      // Adjust page if out of range (e.g., after deletes/filters)
      const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
      if (pageArg > totalPages && total > 0) {
        return getAllExpenses(totalPages, criteria);
      }

      setExpensesList(rows);
      setTotalCount(total);
      setPage(pageArg);
    } finally {
      setIsAllLoading(false);
    }
  };

  // --- UI handlers ---
  const handleSearch = (e) => {
    e?.preventDefault();
    const next = { query, amountMin, amountMax, dateFrom, dateTo };
    setSearchCriteria(next);
    console.log("SEARCH CRITERIA ->", next);
    getAllExpenses(1, next);
  };

  const handleClear = () => {
    setQuery("");
    setAmountMin("");
    setAmountMax("");
    setDateFrom("");
    setDateTo("");
    const cleared = { query: "", amountMin: "", amountMax: "", dateFrom: "", dateTo: "" };
    setSearchCriteria(cleared);
    console.log("SEARCH CRITERIA CLEARED");
    getAllExpenses(1, cleared);
  };

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const canPrev = !isAllLoading && page > 1;
  const canNext = !isAllLoading && page < totalPages;
  const start = totalCount === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const end = totalCount === 0 ? 0 : Math.min(page * PAGE_SIZE, totalCount);

  return (
    <div className="p-10">
      <h2 className="font-bold text-3xl text-shadow-md">
        <span className="flex gap-2 items-center">
          <ArrowLeft onClick={() => route.back()} className="cursor-pointer" />
          All Expenses
        </span>
      </h2>

      {/* SEARCH AREA */}
      <form
        onSubmit={handleSearch}
        className="mt-5 rounded-lg border-2 p-4 shadow-md shadow-indigo-300"
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-6">
          {/* Name search */}
          <div className="lg:col-span-2">
            <label
              htmlFor="search-query"
              className="mb-1 block text-md font-bold text-gray-700"
            >
              Search by name
            </label>
            <Input
              id="search-query"
              placeholder="e.g., Coffee, Uber..."
              value={query}
              className="text-indigo-600"
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          {/* Amount Min */}
          <div>
            <label
              htmlFor="amount-min"
              className="mb-1 block text-sm font-bold text-gray-700"
            >
              Amount (min)
            </label>
            <Input
              id="amount-min"
              type="number"
              inputMode="decimal"
              placeholder="e.g., 0"
              className="text-indigo-600"
              value={amountMin}
              onChange={(e) => setAmountMin(e.target.value)}
              min="0"
            />
          </div>

          {/* Amount Max */}
          <div>
            <label
              htmlFor="amount-max"
              className="mb-1 block text-sm font-bold text-gray-700"
            >
              Amount (max)
            </label>
            <Input
              id="amount-max"
              type="number"
              inputMode="decimal"
              placeholder="e.g., 100"
              className="text-indigo-600"
              value={amountMax}
              onChange={(e) => setAmountMax(e.target.value)}
              min="0"
            />
          </div>

          {/* Date From */}
          <div>
            <label
              htmlFor="date-from"
              className="mb-1 block text-sm font-bold text-gray-700"
            >
              Date From
            </label>
            <Input
              id="date-from"
              type="date"
              className="text-indigo-600"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
            />
          </div>

          {/* Date To */}
          <div>
            <label
              htmlFor="date-to"
              className="mb-1 block text-sm font-bold text-gray-700"
            >
              Date To
            </label>
            <Input
              id="date-to"
              type="date"
              className="text-indigo-600"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={handleClear}
            className="ease-out transform transition-all duration-400 hover:shadow-lg hover:shadow-indigo-300 hover:bg-blue-100 hover:scale-[1.05] text-indigo-600 hover:text-indigo-600"
          >
            Clear
          </Button>
          <Button
            type="submit"
            className="gap-1 ease-out transform transition-all bg-indigo-600 duration-400 hover:scale-[1.05] hover:shadow-lg hover:shadow-indigo-300 hover:bg-indigo-700"
          >
            Search
          </Button>
        </div>
      </form>

      <div className="mt-5 border-2 shadow-md shadow-indigo-300 rounded-lg p-5">
        <ExpenseListTable
          refreshData={() => getAllExpenses(page, searchCriteria)} // keep filters on refresh
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
                onClick={() => getAllExpenses(page - 1, searchCriteria)}
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
                onClick={() => getAllExpenses(page + 1, searchCriteria)}
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

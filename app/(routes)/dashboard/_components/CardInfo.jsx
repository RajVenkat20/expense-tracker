import { Boxes, PiggyBank, ReceiptText } from "lucide-react";
import Link from "next/link";
import React, { useEffect, useState, useMemo } from "react";

function CardInfo({ budgetList, monthlyEarnings = null }) {
  const [totalBudget, setTotalBudget] = useState(0);
  const [totalSpent, setTotalSpent] = useState(0);

  useEffect(() => {
    budgetList && calculateCardsInfo();
  }, [budgetList, monthlyEarnings]);

  const calculateCardsInfo = () => {
    let totalBudget_ = 0;
    let totalSpent_ = 0;

    // If monthlyEarnings is provided (sum of Income.amount for current month), use it.
    if (monthlyEarnings != null) {
      totalBudget_ = Number(monthlyEarnings || 0);
    } else {
      // fallback: sum budgets' amount (legacy behavior)
      budgetList.forEach((element) => {
        totalBudget_ = totalBudget_ + Number(element.amount || 0);
      });
    }

    // totalSpent: sum month-specific spend if available, otherwise fall back to totalSpend
    budgetList.forEach((element) => {
      const monthSpend = Number(element.totalSpendThisMonth ?? element.totalSpend ?? 0);
      totalSpent_ = totalSpent_ + monthSpend;
    });

    setTotalBudget(totalBudget_);
    setTotalSpent(totalSpent_);
  };

  // Current month name (e.g., "November")
    const monthName = React.useMemo(() => {
      try {
        return new Date().toLocaleString(undefined, { month: 'long' });
      } catch (e) {
        return new Date().toLocaleString('en-US', { month: 'long' });
      }
    }, []);

  return (
    <div>
      {budgetList.length > 0 ? (
        <div className="mt-7 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="p-7 rounded-lg flex items-center justify-between border-2 shadow-md shadow-indigo-300 hover:border-indigo-100 hover:shadow-indigo-300">
            <div>
              <h2 className="text-sm">
                {monthName} Earnings
              </h2>
              <h2 className="mt-1 font-bold text-xl text-green-600">
                ${Math.abs(totalBudget).toFixed(2)}
              </h2>
            </div>
            <PiggyBank className="bg-indigo-600 p-3 h-12 w-12 rounded-full text-white shadow-lg animate-pulse cursor-pointer transform transition-all duration-400 hover:scale-120 hover:shadow-lg hover:bg-green-600 ease-out" />
          </div>
          <div className="p-7 rounded-lg flex items-center justify-between border-2 shadow-md shadow-indigo-300  hover:border-indigo-100 hover:shadow-indigo-300">
            <div>
              <h2 className="text-sm">{monthName} Expenses</h2>
              <h2 className="mt-1 font-bold text-xl text-red-600">
                ${Math.abs(totalSpent).toFixed(2)}
              </h2>
            </div>
            <ReceiptText className="bg-indigo-600 p-3 h-12 w-12 rounded-full text-white shadow-lg animate-pulse cursor-pointer transform transition-all duration-400 hover:scale-120 hover:shadow-lg hover:bg-red-600 ease-out" />
          </div>
          <div className="p-7 rounded-lg flex items-center justify-between border-2 shadow-md shadow-indigo-300 hover:border-indigo-100 hover:shadow-indigo-300">
            <Link href={"/dashboard/budgets"}>
              <div>
                <h2 className="text-sm">Expense Categories</h2>
                <h2 className="mt-1 font-bold text-xl text-indigo-600">
                  #{budgetList.length}
                </h2>
              </div>
            </Link>
            <Boxes className="bg-indigo-600 p-3 h-12 w-12 rounded-full text-white shadow-lg  animate-pulse cursor-pointer transform transition-all duration-400 hover:scale-120 hover:shadow-lg ease-out" />
          </div>
        </div>
      ) : (
        <div className="mt-7 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((item, idx) => (
            <div
              key={idx}
              className="h-[110px] w-full bg-slate-200 animate-pulse rounded-lg"
            ></div>
          ))}
        </div>
      )}
    </div>
  );
}

export default CardInfo;

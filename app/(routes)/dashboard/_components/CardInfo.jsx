import { Boxes, PiggyBank, ReceiptText } from "lucide-react";
import Link from "next/link";
import React, { useEffect, useState } from "react";

function CardInfo({ budgetList }) {
  const [totalBudget, setTotalBudget] = useState(0);
  const [totalSpent, setTotalSpent] = useState(0);

  useEffect(() => {
    budgetList && calculateCardsInfo();
  }, [budgetList]);

  const calculateCardsInfo = () => {
    let totalBudget_ = 0;
    let totalSpent_ = 0;

    budgetList.forEach((element) => {
      totalBudget_ = totalBudget_ + Number(element.amount);
      totalSpent_ = totalSpent_ + element.totalSpend;
    });

    setTotalBudget(totalBudget_);
    setTotalSpent(totalSpent_);
  };

  return (
    <div>
      {budgetList.length > 0 ? (
        <div className="mt-7 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="p-7 border rounded-lg flex items-center justify-between border-2 shadow-md shadow-indigo-300 transform transition-all duration-400 hover:scale-104 hover:shadow-lg ease-out cursor-pointer hover:border-indigo-100 hover:shadow-indigo-300">
            <div>
              <h2 className="text-sm">Total Budget</h2>
              <h2 className="mt-1 font-bold text-xl text-green-600">
                +${totalBudget}
              </h2>
            </div>
            <PiggyBank className="bg-indigo-600 p-3 h-12 w-12 rounded-full text-white shadow-lg animate-pulse" />
          </div>
          <div className="p-7 border rounded-lg flex items-center justify-between border-2 shadow-md shadow-indigo-300 transform transition-all duration-400 hover:scale-104 hover:shadow-lg ease-out cursor-pointer hover:border-indigo-100 hover:shadow-indigo-300">
            <div>
              <h2 className="text-sm">Total Spent</h2>
              <h2 className="mt-1 font-bold text-xl text-red-600">
                -${totalSpent}
              </h2>
            </div>
            <ReceiptText className="bg-indigo-600 p-3 h-12 w-12 rounded-full text-white shadow-lg animate-pulse" />
          </div>
          <Link href={"/dashboard/budgets"}>
            <div className="p-7 border rounded-lg flex items-center justify-between border-2 shadow-md shadow-indigo-300 transform transition-all duration-400 hover:scale-104 hover:shadow-lg ease-out cursor-pointer hover:border-indigo-100 hover:shadow-indigo-300">
              <div>
                <h2 className="text-sm">Expense Categories</h2>
                <h2 className="mt-1 font-bold text-xl text-indigo-600">
                  #{budgetList.length}
                </h2>
              </div>
              <Boxes className="bg-indigo-600 p-3 h-12 w-12 rounded-full text-white shadow-lg animate-pulse" />
            </div>
          </Link>
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

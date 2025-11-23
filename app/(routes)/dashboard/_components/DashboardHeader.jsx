import { useUser } from "@clerk/nextjs";
import React, { useMemo } from "react";
import { Menu, PlusCircle, CreditCard } from "lucide-react";
import Link from "next/link";

function DashboardHeader({ onMenuClick }) {
  const { user } = useUser();

  const greeting = useMemo(() => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 18) return "Good afternoon";
    return "Good evening";
  }, []);

  // Current month name and percent through month (for a small progress indicator)
  const monthName = useMemo(() => {
    try {
      return new Date().toLocaleString(undefined, { month: "long" });
    } catch (e) {
      return new Date().toLocaleString("en-US", { month: "long" });
    }
  }, []);

  const percentThroughMonth = useMemo(() => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const total = (end - start) / (1000 * 60 * 60 * 24);
    const day = now.getDate();
    const pct = Math.round((day / total) * 100);
    return Math.min(100, Math.max(0, pct));
  }, []);

  return (
    <div className="p-5 shadow-md items-center border-b border-slate-200 flex justify-between bg-indigo-50">
      {/* Left: greeting */}
      <div>
        <h2 className="font-bold text-3xl">
          {greeting},{" "}
          <span className="text-indigo-600">{user?.firstName}!</span>
          {/* ✌️ */}
        </h2>
        <div className="flex items-center gap-4 mt-2">
          {/* <p className="text-gray-600">Here's what's happening with your money!</p> */}
        </div>

        
        {/* Month info + progress */}
        <div className="text-sm text-gray-600">
          <div className="font-medium">
            {monthName} • {percentThroughMonth}% through month
          </div>
          <div className="w-44 h-2 bg-slate-200 rounded-full overflow-hidden mt-1">
            <div
              className="h-2 bg-indigo-600"
              style={{ width: `${percentThroughMonth}%` }}
            />
          </div>
        </div>
      </div>

      {/* Right: hamburger (mobile only) */}
        <div className="md:hidden">
          <button
            type="button"
            className="inline-flex transform transition-all ease-out duration-400 items-center justify-center rounded-md p-2 hover:bg-blue-200 hover:shadow-lg hover:shadow-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-600"
            aria-label="Open menu"
            aria-controls="mobile-sidebar"
            aria-expanded="false"
            onClick={onMenuClick}
          >
            <Menu className="h-7 w-7 text-indigo-700" />
          </button>
        </div>
    </div>
  );
}

export default DashboardHeader;

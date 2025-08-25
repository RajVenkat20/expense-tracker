import { useUser } from "@clerk/nextjs";
import React, { useMemo } from "react";
import { Menu } from "lucide-react";

function DashboardHeader({ onMenuClick }) {
  const { user } = useUser();

  const greeting = useMemo(() => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 18) return "Good afternoon";
    return "Good evening";
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
        <p className="text-gray-600 mt-2">
          Here's what's happening with your money!
        </p>
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

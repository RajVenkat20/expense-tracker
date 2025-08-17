"use client";

import React, { useEffect, useState } from "react";
import SideNav from "./_components/SideNav";
import DashboardHeader from "./_components/DashboardHeader";
import { db } from "@/utils/dbConfig";
import { Budgets } from "@/utils/schema";
import { useUser } from "@clerk/nextjs";
import { eq } from "drizzle-orm";
import { useRouter } from "next/navigation";
import clsx from "clsx";

function DashboardLayout({ children }) {
  const { user } = useUser();
  const router = useRouter();

  // Desktop collapse
  const [collapsed, setCollapsed] = useState(false);

  // Mobile drawer
  const [mobileOpen, setMobileOpen] = useState(false);

  // persist collapse choice
  useEffect(() => {
    const saved = typeof window !== "undefined" && localStorage.getItem("pp-nav-collapsed");
    if (saved != null) setCollapsed(saved === "true");
  }, []);
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("pp-nav-collapsed", String(collapsed));
    }
  }, [collapsed]);

  // optional: lock scroll when mobile drawer open
  useEffect(() => {
    if (mobileOpen) document.body.classList.add("overflow-hidden");
    else document.body.classList.remove("overflow-hidden");
  }, [mobileOpen]);

  useEffect(() => {
    user && checkUserBudgets();
  }, [user]);

  const checkUserBudgets = async () => {
    const result = await db
      .select()
      .from(Budgets)
      .where(eq(Budgets.createdBy, user.primaryEmailAddress.emailAddress));
    if (result.length === 0) router.replace("/dashboard/budgets");
  };

  return (
    <div>
      {/* Desktop sidebar */}
      <div className={clsx("fixed hidden md:block transition-all duration-300", collapsed ? "w-16" : "w-64")}>
        <SideNav collapsed={collapsed} setCollapsed={setCollapsed} />
      </div>

      {/* Mobile drawer sidebar */}
      <div className="md:hidden">
        {/* Backdrop */}
        <div
          className={clsx(
            "fixed inset-0 z-40 bg-black/40 transition-opacity",
            mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          )}
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
        {/* Panel */}
        <aside
          className={clsx(
            "fixed z-50 inset-y-0 left-0 w-64 bg-white shadow-xl border-r transition-transform duration-300",
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          )}
          role="dialog"
          aria-modal="true"
        >
          <SideNav
            collapsed={false}            // always full width on mobile
            setCollapsed={() => {}}      // not used on mobile
          />
        </aside>
      </div>

      {/* Main content */}
      <div className={clsx("transition-all duration-300", "md:ml-16", !collapsed && "md:ml-64")}>
        {/* Pass a handler to open the drawer from your header */}
        <DashboardHeader onMenuClick={() => setMobileOpen(true)} />
        {children}
      </div>
    </div>
  );
}

export default DashboardLayout;

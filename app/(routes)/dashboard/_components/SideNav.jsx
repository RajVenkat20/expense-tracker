"use client";

import {
  LayoutGrid,
  PiggyBank,
  ReceiptText,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import React from "react";
import { UserButton, useUser } from "@clerk/nextjs";
import { usePathname } from "next/navigation";
import Link from "next/link";
import clsx from "clsx";

function SideNav({
  collapsed = false,
  setCollapsed,
  onMobileClose, // if present, we are in the mobile drawer context
}) {
  const { user } = useUser();
  const isMobileDrawer = typeof onMobileClose === "function";

  const menuList = [
    { id: 1, name: "Dashboard", icon: LayoutGrid, path: "/dashboard" },
    { id: 2, name: "Budgets", icon: PiggyBank, path: "/dashboard/budgets" },
    { id: 3, name: "Expenses", icon: ReceiptText, path: "/dashboard/expenses" },
    { id: 4, name: "Reports", icon: ReceiptText, path: "/dashboard/expenses" },
  ];

  const path = usePathname();

  return (
    <aside
      className={clsx(
        "h-screen p-3 border-r bg-white shadow-md flex flex-col",
        "transition-[width] duration-300",
        collapsed ? "w-16" : "w-64"
      )}
      aria-label="Sidebar"
    >
      {/* Brand row */}
      <div
        className={clsx(
          "flex items-center px-2",
          collapsed ? "justify-center" : "justify-between"
        )}
      >
        <Link href="/dashboard" className="flex items-center gap-2">
          {!collapsed && (
            <h2 className="text-xl font-bold text-indigo-600">PennyPilot</h2>
          )}
        </Link>

        {/* Right-side control:
            - Desktop: show collapse chevron if setCollapsed is provided
            - Mobile drawer: show a Close (X) button that calls onMobileClose
        */}
        {!collapsed && (
          isMobileDrawer ? (
            <button
              onClick={onMobileClose}
              className="rounded-md p-2 transform transition-all ease-out duration-400 hover:shadow-lg hover:shadow-indigo-300 hover:bg-blue-100"
              aria-label="Close menu"
              title="Close"
            >
              <X className="h-6 w-6 text-indigo-600" />
            </button>
          ) : (
            setCollapsed && (
              <button
                onClick={() => setCollapsed(true)}
                className="rounded-md p-2 hover:bg-blue-100 transform transition-all ease-out duration-400 hover:shadow-lg hover:shadow-blue-200 hover:scale-105"
                aria-label="Collapse sidebar"
              >
                <ChevronLeft className="h-6 w-6 text-indigo-600" />
              </button>
            )
          )
        )}
      </div>

      {/* When collapsed (desktop only), render expand chevron */}
      {collapsed && !isMobileDrawer && setCollapsed && (
        <button
          onClick={() => setCollapsed(false)}
          className="mt-2 mx-auto rounded-md p-2 hover:bg-blue-100 transform transition-all ease-out duration-400 hover:shadow-lg hover:shadow-blue-200 hover:scale-105"
          aria-label="Expand sidebar"
          title="Expand"
        >
          <ChevronRight className="h-6 w-6 text-indigo-600" />
        </button>
      )}

      {/* Menu */}
      <nav className="mt-4 flex-1">
        {menuList.map((menu) => {
          const active = path === menu.path;
          const Icon = menu.icon;
          return (
            <Link
              href={menu.path}
              key={menu.id}
              onClick={onMobileClose /* close drawer on tap (mobile only) */}
            >
              <div
                className={clsx(
                  "flex items-center gap-3 mb-2 rounded-md px-3 py-3 cursor-pointer",
                  "text-gray-700 hover:text-indigo-700 hover:bg-blue-100 hover:shadow-lg transition-all duration-200",
                  active && "text-indigo-700 bg-blue-100",
                  collapsed && "justify-center"
                )}
                title={collapsed ? menu.name : undefined}
              >
                <Icon className="h-5 w-5 shrink-0" />
                {!collapsed && <span className="font-medium">{menu.name}</span>}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div
        className={clsx(
          "mb-4 flex items-center gap-3 px-2",
          collapsed && "justify-center"
        )}
      >
        <UserButton
          appearance={{
            elements: {
              avatarBox: { width: "35px", height: "35px" },
            },
          }}
        />
        {!collapsed && (
          <span className="text-base text-indigo-600">{user?.firstName}</span>
        )}
      </div>
    </aside>
  );
}

export default SideNav;

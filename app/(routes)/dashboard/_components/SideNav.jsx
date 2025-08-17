"use client";

import { LayoutGrid, PiggyBank, ReceiptText, ShieldCheck } from "lucide-react";
import Image from "next/image";
import React, { useEffect } from "react";
import { UserButton, useUser } from "@clerk/nextjs";
import { usePathname } from "next/navigation";
import Link from "next/link";

function SideNav() {
  const {user} = useUser();
  const menuList = [
    {
      id: 1,
      name: "Dashboard",
      icon: LayoutGrid,
      path: "/dashboard",
    },
    {
      id: 2,
      name: "Budgets",
      icon: PiggyBank,
      path: "/dashboard/budgets",
    },
    {
      id: 3,
      name: "Expenses",
      icon: ReceiptText,
      path: "/dashboard/expenses",
    },
  ];

  const path = usePathname();

  return (
    <div className="h-screen p-5 border shadow-md">
      <div className="flex gap-2 items-center just pl-4 pr-4 border-bottom">
        <Image src={"/logo.svg"} alt="PennyPilot Logo" width={50} height={50} />
        <h2 className="text-2xl font-bold text-indigo-600">PennyPilot</h2>
      </div>
      <div className="mt-5">
        {menuList.map((menu, idx) => (
          <Link href={menu.path} key={idx}>
            <h2
              className={`flex gap-2 items-center text-gray-700 font-medium mb-3 p-5 cursor-pointer rounded-md hover:text-indigo-700 hover:bg-blue-100 hover:shadow-lg transition-all duration-400 ${
                path == menu.path && "text-indigo-700 bg-blue-100"
              }`}
            >
              <menu.icon />
              {menu.name}
            </h2>
          </Link>
        ))}
      </div>
      <div className="fixed bottom-10 p-3 flex gap-3 items-center">
        <UserButton />
        {user?.firstName}
      </div>
    </div>
  );
}

export default SideNav;

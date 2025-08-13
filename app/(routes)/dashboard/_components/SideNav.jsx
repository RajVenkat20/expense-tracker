import { LayoutGrid, PiggyBank, ReceiptText, ShieldCheck } from "lucide-react";
import Image from "next/image";
import React from "react";
import { UserButton } from "@clerk/nextjs";

function SideNav() {
  const menuList = [
    {
      id: 1,
      name: "Dashboard",
      icon: LayoutGrid,
      path: '',
    },
    {
      id: 2,
      name: "Budgets",
      icon: PiggyBank,
      path: '',
    },
    {
      id: 3,
      name: "Expenses",
      icon: ReceiptText,
      path: '',
    },
    {
      id: 4,
      name: "Upgrade",
      icon: ShieldCheck,
      path: '',
    },
  ];

  return (
    <div className="h-screen p-5 border shadow-md">
      <Image src={"/logo.svg"} alt="PennyPilot Logo" width={50} height={50} />
      <div className="mt-5">
        {menuList.map((menu, idx) => (
            <h2 className="flex gap-2 items-center text-gray-700 font-medium p-5 cursor-pointer rounded-md hover:text-indigo-700 hover:bg-blue-100 hover:shadow-md transition-all duration-400">
                <menu.icon/>
                {menu.name}
            </h2>
        ))}
      </div>
      <div className="fixed bottom-10 p-5 flex gap-2 items-center">
        <UserButton/>
        Profile
      </div>
    </div>
  );
}

export default SideNav;

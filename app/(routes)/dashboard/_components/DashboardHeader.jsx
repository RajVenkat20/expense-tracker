import { UserButton, useUser } from "@clerk/nextjs";
import React, { useMemo } from "react";

function DashboardHeader() {
  const {user} = useUser();

  const greeting = useMemo(() => {
    const h = new Date().getHours();
    if(h < 12) return "Good morning";
    if(h < 18) return "Good afternoon"
    return "Good evening"
  }, []);

  return (
    <div className="p-5 shadow-md items-center border-bottom flex justify-between bg-blue-100">
      <div>
        <h2 className="font-bold text-3xl">
          {greeting}, <span className="text-indigo-600">{user?.firstName}!</span> ✌️
        </h2>
        <p className="text-gray-500 mt-2">
          Here's what's happening with your money!
        </p>
      </div>
      <div>
        <UserButton appearance={{ elements: { avatarBox: "h-10 w-10" } }}/>
      </div>
    </div>
  );
}

export default DashboardHeader;

"use client";

import { Button } from "@/components/ui/button";
import Image from "next/image";
import React from "react";
import { UserButton, useUser } from "@clerk/nextjs";
import Link from "next/link";

function Header() {
  const { user, isSignedIn } = useUser();

  return (
    <div className="p-5 flex justify-between items-center border shadow-md bg-indigo-100">
      {/* <Image src={"./logo.svg"} alt="App Logo" width={50} height={50} /> */}
      <h2 className="font-bold text-2xl text-shadow-lg animate-pulse text-indigo-600 transform transition-all ease-out duration-400 hover:scale-110">
        PennyPilot
      </h2>
      {isSignedIn ? (
        <UserButton />
      ) : (
        <Link href={"/sign-in"}>
          <Button className="bg-indigo-600 px-5 py-3 font-medium transform transition-all duration-400 ease-out text-white shadow-lg hover:bg-indigo-700 hover:scale-110">
            Sign In/Up
          </Button>
        </Link>
      )}
    </div>
  );
}

export default Header;

"use client";

import { Button } from "@/components/ui/button";
import { PenBox } from "lucide-react";
import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import EmojiPicker from "emoji-picker-react";
import { useUser } from "@clerk/nextjs";
import { Input } from "@/components/ui/input";
import { db } from "@/utils/dbConfig";
import { Budgets } from "@/utils/schema";
import { eq } from "drizzle-orm";
import { toast } from "sonner";

function EditBudget({budgetInfo, refreshData}) {
  const [emojiIcon, setEmojiIcon] = useState();
  const [openEmojiPicker, setOpenEmojiPicker] = useState(false);
  const [name, setName] = useState();
  const [amount, setAmount] = useState();
  const { user } = useUser();

  useEffect(() => {
    if (budgetInfo) {
      setEmojiIcon(budgetInfo.icon ?? "");
      setName(budgetInfo.name ?? "");
      setAmount(budgetInfo.amount ?? "");
    }
  }, [budgetInfo]);

  const onUpdateBudget = async () => {
    const result = await db.update(Budgets).set({
        name : name,
        amount : amount,
        icon : emojiIcon,
    }).where(eq(Budgets.id, budgetInfo.id)).returning();

    if(result)
    {
        refreshData()
        toast.success('Budget Type Edited Successfully!',{
        className: 'text-green-600 font-semibold'
      })
    }
  };

  if (!budgetInfo) return null;

  return (
    <div>
      <Dialog>
        <DialogTrigger asChild>
          <Button className="flex gap-2 bg-indigo-600 hover:bg-indigo-700 transform transition-all ease-out duration-400 hover:scale-103 hover:shadow-lg">
            <PenBox />
            Edit Budget Type
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Budget Type</DialogTitle>
            <DialogDescription>
              <div className="mt-5 transition-all duration-400">
                <h2 className="text-black font-md my-1">Select An Icon</h2>
                <Button
                  variant="outline"
                  className="text-lg transform transition-all duration-400 ease-out hover:shadow-lg hover:scale-102"
                  onClick={() => setOpenEmojiPicker(!openEmojiPicker)}
                >
                  {emojiIcon}
                </Button>
                <div className="absolute z-20">
                  <EmojiPicker
                    open={openEmojiPicker}
                    onEmojiClick={(e) => {
                      setEmojiIcon(e.emoji);
                      setOpenEmojiPicker(false);
                    }}
                  />
                </div>
                <div className="mt-4">
                  <h2 className="text-black font-md my-1">Budget Type Name</h2>
                  <Input
                    defaultValue={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div className="mt-4">
                  <h2 className="text-black font-md my-1">Amount Limit</h2>
                  <Input
                    type="number"
                    defaultValue={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>
              </div>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-start">
            <DialogClose asChild>
              <Button
                disabled={!(name && amount)}
                onClick={() => onUpdateBudget()}
                className="mt-10 w-full bg-indigo-600 hover:bg-indigo-700 hover:shadow-md hover:h-15 transition-all duration-400"
              >
                Edit
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default EditBudget;

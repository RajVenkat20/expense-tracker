"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import EmojiPicker from "emoji-picker-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { db } from "@/utils/dbConfig";
import { Budgets } from "@/utils/schema";
import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

function CreateBudget({ refreshData }) {
  const { user } = useUser();

  const [open, setOpen] = useState(false);                // controlled dialog
  const [isSaving, setIsSaving] = useState(false);        // loading state

  const [emojiIcon, setEmojiIcon] = useState("😀");
  const [openEmojiPicker, setOpenEmojiPicker] = useState(false);
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");

  const resetForm = () => {
    setEmojiIcon("😀");
    setOpenEmojiPicker(false);
    setName("");
    setAmount("");
  };

  const handleOpenChange = (nextOpen) => {
    // prevent closing while saving
    if (isSaving) return;
    setOpen(nextOpen);
    if (!nextOpen) resetForm();
  };

  // Submit handler (supports Enter key)
  const onCreateBudget = async (e) => {
    e?.preventDefault();

    if (!user?.primaryEmailAddress?.emailAddress) {
      toast.error("You must be signed in to create a budget.");
      return;
    }

    // Basic validation
    const trimmedName = String(name || "").trim();
    const numAmount = parseFloat(String(amount || "").trim());

    if (!trimmedName) {
      toast.error("Please enter a budget name.");
      return;
    }
    if (!Number.isFinite(numAmount) || numAmount <= 0) {
      toast.error("Please enter a valid amount greater than 0.");
      return;
    }

    try {
      setIsSaving(true);

      // Budgets.amount is a varchar in your schema — store a clean numeric string
      const result = await db
        .insert(Budgets)
        .values({
          name: trimmedName,
          amount: String(numAmount),
          createdBy: user.primaryEmailAddress.emailAddress,
          icon: emojiIcon,
        })
        .returning({ insertedId: Budgets.id });

      if (result) {
        toast.success("New Category Created!", {
          className: "text-green-600 font-semibold",
        });
        refreshData?.();
        // Close dialog after success
        setOpen(false);
        resetForm();
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to create budget. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogTrigger asChild>
          <div className="transform ease-out shadow-md hover:scale-102 bg-slate-100 p-10 rounded-md items-center flex flex-col border-2 border-dashed cursor-pointer hover:shadow-md hover:shadow-indigo-300 hover:bg-slate-200 transition-all duration-400 h-[150px]">
            <h2 className="text-3xl">+</h2>
            <h2>New Category</h2>
          </div>
        </DialogTrigger>

        <DialogContent className="sm:max-w-md" aria-busy={isSaving}>
          <DialogHeader>
            <DialogTitle>Create New Category</DialogTitle>
            <DialogDescription asChild>
              {/* Form so Enter submits */}
              <form onSubmit={onCreateBudget} className="mt-5 space-y-4">
                {/* Emoji picker */}
                <div>
                  <h2 className="text-black font-md mb-1">Select An Icon</h2>
                  <div className="relative inline-block">
                    <Button
                      type="button"
                      variant="outline"
                      className="text-lg transform transition-all duration-400 ease-out hover:shadow-lg hover:scale-102"
                      onClick={() => setOpenEmojiPicker((v) => !v)}
                      disabled={isSaving}
                      aria-expanded={openEmojiPicker}
                      aria-controls="emoji-popover"
                    >
                      {emojiIcon}
                    </Button>

                    <div
                      id="emoji-popover"
                      className="absolute z-50 mt-2"
                      style={{ display: openEmojiPicker ? "block" : "none" }}
                    >
                      <EmojiPicker
                        open={openEmojiPicker}
                        onEmojiClick={(e) => {
                          setEmojiIcon(e.emoji);
                          setOpenEmojiPicker(false);
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Name */}
                <div>
                  <h2 className="text-black font-md mb-1">Budget Type Name</h2>
                  <Input
                    placeholder="e.g. Home Decor"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={isSaving}
                    autoFocus
                  />
                </div>

                {/* Amount */}
                <div>
                  <h2 className="text-black font-md mb-1">Amount Limit</h2>
                  <Input
                    type="number"
                    inputMode="decimal"
                    min="0"
                    step="0.01"
                    placeholder="e.g. 5000"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    disabled={isSaving}
                  />
                </div>

                <DialogFooter className="sm:justify-start pt-2">
                  <Button
                    type="submit"
                    disabled={isSaving || !(name && amount)}
                    className="mt-4 w-full bg-indigo-600 hover:bg-indigo-700 hover:shadow-md transition-all duration-400"
                  >
                    {isSaving ? (
                      <span className="inline-flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Creating…
                      </span>
                    ) : (
                      "Create Budget Type"
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default CreateBudget;

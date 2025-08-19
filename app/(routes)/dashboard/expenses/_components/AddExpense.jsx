import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { db } from "@/utils/dbConfig";
import { Budgets, Expenses } from "@/utils/schema";
import { Loader } from "lucide-react";
import moment from "moment";
import React, { useState } from "react";
import { toast } from "sonner";

function AddExpense({ budgetId, user, refreshData }) {
  const [name, setName] = useState();
  const [amount, setAmount] = useState();
  const [loading, setLoading] = useState(false);

  // Function to add a new expense for a specified budget type
  const addNewExpense = async () => {
    setLoading(true);
    const result = await db
      .insert(Expenses)
      .values({
        name: name,
        amount: amount,
        budgetId: budgetId,
        createdAt: moment().format("YYYY-MM-DD"),
      })
      .returning({ insertedId: Budgets.id });

    setAmount("");
    setName("");

    if (result) {
      setLoading(false);
      refreshData();
      toast.success("Expense Added Successfully!", {
        className: "text-green-600 font-semibold",
      });
    }
    setLoading(false);
  };

  return (
    <div className="border p-5 shadow-md shadow-indigo-300 rounded-lg transform ease-out hover:scale-102 hover:shadow-lg  transition-all duration-400">
      <h2 className="font-bold text-lg">Add Expense</h2>
      <div className="mt-4">
        <h2 className="text-black font-md my-1">Expense Name</h2>
        <Input
          placeholder="e.g. Starbucks Coffee"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      <div className="mt-4">
        <h2 className="text-black font-md my-1">Expense Amount</h2>
        <Input
          placeholder="e.g. $10"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
      </div>
      <Button
        disabled={!(name && amount) || loading}
        onClick={() => addNewExpense()}
        className="mt-4 w-full bg-indigo-600 hover:bg-indigo-600 hover:animate-pulse transition-all duration-400"
      >
        {loading ? <Loader className="animate-spin" /> : "Add New Expense"}
      </Button>
    </div>
  );
}

export default AddExpense;

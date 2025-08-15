import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { db } from "@/utils/dbConfig";
import { Budgets, Expenses } from "@/utils/schema";
import React, { useState } from "react";
import { toast } from "sonner";

function AddExpense({budgetId, user, refreshData}) {

    const [name, setName] = useState();
    const [amount, setAmount] = useState();

    const addNewExpense = async() => {
      const result = await db.insert(Expenses).values({
        name : name,
        amount : amount,
        budgetId : budgetId,
        createdAt : user.primaryEmailAddress.emailAddress
      }).returning({insertedId : Budgets.id})

      console.log(result)
      if(result)
      {
        refreshData()
        toast('New Expense Added Successfully')
      }
    }

  return (
    <div className="border p-5 rounded-lg transform ease-out hover:scale-102 hover:shadow-lg hover:shadow-indigo-300 transition-all duration-400">
      <h2 className="font-bold text-lg">Add Expense</h2>
      <div className="mt-4">
        <h2 className="text-black font-md my-1">Expense Name</h2>
        <Input
          placeholder="e.g. Starbucks Coffee"
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      <div className="mt-4">
        <h2 className="text-black font-md my-1">Expense Amount</h2>
        <Input
          placeholder="e.g. $10"
          onChange={(e) => setAmount(e.target.value)}
        />
      </div>
      <Button disabled={!(name && amount)} 
      onClick={() => addNewExpense()}
      className='mt-4 w-full bg-indigo-600 hover:bg-indigo-600 hover:animate-pulse transition-all duration-400'>Add New Expense</Button>
    </div>
  );
}

export default AddExpense;

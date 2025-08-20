import { PiggyBank } from 'lucide-react'
import React from 'react'

function CreateIncomeExpense() {
  return (
    <div className="mt-7 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-7 border rounded-lg flex items-center justify-between border-2 shadow-md shadow-indigo-300 transform transition-all duration-400 hover:scale-104 hover:shadow-lg ease-out cursor-pointer hover:border-indigo-100 hover:shadow-indigo-300">
            <div>
              <h2 className="text-sm">Add Income</h2>
            </div>
            <PiggyBank className="bg-indigo-600 p-3 h-12 w-12 rounded-full text-white shadow-lg animate-pulse" />
          </div>
          <div className="p-7 border rounded-lg flex items-center justify-between border-2 shadow-md shadow-indigo-300 transform transition-all duration-400 hover:scale-104 hover:shadow-lg ease-out cursor-pointer hover:border-indigo-100 hover:shadow-indigo-300">
            <div>
              <h2 className="text-sm">Add Expense</h2>
            </div>
            <PiggyBank className="bg-indigo-600 p-3 h-12 w-12 rounded-full text-white shadow-lg animate-pulse" />
          </div>
    </div>
  )
}

export default CreateIncomeExpense
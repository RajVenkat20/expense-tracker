import React from 'react'

function BudgetItem({budget}) {

  return (
    <div className='p-5 border rounded-lg hover:shadow-md cursor-pointer hover:shadow-indigo-300 hover:border-1 transition-all duration-400 '>
      <div className='flex gap-2 items-center justify-between'>
        <div className='flex gap-2 items-center'>
            <h2 className='text-2xl p-3 px-4 bg-slate-100 rounded-full'>{budget.icon}</h2>
            <div>
              <h2 className='font-bold'>{budget.name}</h2>
              <h2 className='text-sm text-gray-500'>{budget.totalItem} Item(s)</h2>
            </div>
        </div>
        <h2 className='font-bold text-indigo-600 text-lg'>${budget.amount}</h2>
        </div>

        <div className='mt-5'>
          <div className='flex items-center justify-between mb-3'>
            <h2 className='text-xs text-slate-400'>${budget.totalSpend?budget.totalSpend:0} Spent</h2>
            <h2 className='text-xs text-slate-400'>${budget.amount-budget.totalSpend} Remaining</h2>
          </div>
          <div className='w-full bg-slate-300 h-2 rounded-full'>
            <div className='w-[40%] bg-indigo-600 h-2 rounded-full'>
            </div>
          </div>
        </div>
    </div>
  )
}

export default BudgetItem
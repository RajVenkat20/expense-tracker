import Link from 'next/link'
import React from 'react'

function BudgetItem({budget}) {

  const calculateProgress = () => {
    const percentage = (budget.totalSpend / budget.amount) * 100
    return percentage.toFixed(2);
  }

  return (
    <Link href={'/dashboard/expenses/' + budget.id} className='p-5 border-2 shadow-md rounded-lg hover:shadow-lg transform ease-out hover:scale-102 cursor-pointer hover:border-indigo-100 hover:shadow-indigo-300 transition-all duration-400 h-[170px]'>
      <div className='flex gap-2 items-center justify-between'>
        <div className='flex gap-2 items-center'>
            <h2 className='text-2xl p-3 px-4 bg-slate-100 rounded-full shadow-md'>{budget.icon}</h2>
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
            {/* Calculating the progress bar dynamically */}
            <div className='bg-indigo-600 h-2 rounded-full' style={{width : `${calculateProgress()}%`}}>
            </div>
          </div>
        </div>
    </Link>
  )
}

export default BudgetItem
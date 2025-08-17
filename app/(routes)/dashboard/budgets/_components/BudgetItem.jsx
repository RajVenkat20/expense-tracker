import Link from 'next/link'
import React from 'react'

function BudgetItem({ budget }) {

  const safeAmount = Number(budget?.amount) || 0;
  const safeSpend  = Number(budget?.totalSpend) || 0;

  const calculateProgress = () => {
    if (safeAmount <= 0) return 0;
    const pct = (safeSpend / safeAmount) * 100;
    return Math.min(100, Math.max(0, pct));
  };

  const isOver = safeSpend > safeAmount;

  return (
    <Link href={'/dashboard/expenses/' + budget.id} >
      <div
        className={`p-5 border-2 shadow-md rounded-lg hover:shadow-lg transform ease-out hover:scale-102 cursor-pointer hover:border-indigo-100 transition-all duration-400 h-[170px] 
        ${isOver ? 'shadow-red-300 hover:shadow-red-400' : 'shadow-indigo-300 hover:shadow-indigo-300'}`}
      >
        <div className='flex gap-2 items-center justify-between'>
          <div className='flex gap-2 items-center'>
            <h2 className='text-2xl p-3 px-4 bg-slate-100 rounded-full shadow-md'>{budget.icon}</h2>
            <div>
              <h2 className='font-bold'>{budget.name}</h2>
              <h2 className='text-sm text-gray-500'>{budget.totalItem} Item(s)</h2>
            </div>
          </div>
          <h2 className='font-bold text-indigo-600 text-lg'>${safeAmount}</h2>
        </div>

        <div className='mt-5'>
          <div className='flex items-center justify-between mb-3'>
            <h2 className='text-xs text-slate-400'>${safeSpend} Spent</h2>
            {!isOver ? (
              <h2 className='text-xs text-slate-400'>${safeAmount - safeSpend} Remaining</h2>
            ) : (
              <h2 className='text-xs text-red-600'>Over by ${Math.abs(safeAmount - safeSpend)}</h2>
            )}
          </div>

          {/* Track */}
          <div className='w-full bg-slate-300 h-2 rounded-full overflow-hidden'>
            <div
              className={`${isOver ? 'bg-red-500 animate-pulse' : 'bg-indigo-600'} h-2 rounded-full transition-all`}
              style={{ width: `${calculateProgress()}%` }}
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(calculateProgress())}
            />
          </div>
        </div>
      </div>
    </Link>
  )
}

export default BudgetItem

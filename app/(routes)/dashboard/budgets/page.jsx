import React from 'react'
import BudgetList from './_components/BudgetList'

function Budget() {
  return (
    <div className='p-10'>
        <h2 className='font-bold text-3xl text-shadow-md'>My Budget Types</h2>
        <BudgetList/>
    </div>
  )
}

export default Budget
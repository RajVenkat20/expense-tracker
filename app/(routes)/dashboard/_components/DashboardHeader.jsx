import { UserButton } from '@clerk/nextjs'
import React from 'react'

function DashboardHeader() {
  return (
    <div className='p-5 shadow-md border-bottom flex justify-between'>
        <div>
            {/* Content to be added later according to need */}
        </div>
        <div>
            <UserButton/>
        </div>
    </div>
  )
}

export default DashboardHeader
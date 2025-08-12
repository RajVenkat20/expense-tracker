import { Button } from '@/components/ui/button'
import Image from 'next/image'
import React from 'react'

function Header() {
  return (
    <div className='p-5 flex justify-between items-center border shadow-md'>
        <Image src={'./logo.svg'}
               alt="App Logo"
               width={50}
               height={50}/>
        <Button /*variant='outline'*/ className="border-indigo-600 bg-indigo-600 px-5 py-3 font-medium text-white shadow-md transition-colors hover:bg-indigo-700">Get Started</Button>
    </div>
  )
}

export default Header
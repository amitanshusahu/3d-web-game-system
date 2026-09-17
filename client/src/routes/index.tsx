import { createFileRoute, useRouter } from '@tanstack/react-router'
import { useEffect } from 'react'

export const Route = createFileRoute('/')({
  component: LandingPage,
})

function LandingPage() {
  const router = useRouter()

  // if already logged in, redirect to /chat/new
  useEffect(() => {
    localStorage.getItem('token') && router.navigate({ to: '/chat/new' })
  })

  return (
    <div className='w-full min-h-screen bg-black text-white'>
      <div className='flex justify-between w-full gap-4'>
        <div>logo</div>
        <div className='flex gap-4'>
          <button>login</button>
          <button>signup</button>
        </div>
      </div>
      <div className='flex flex-col items-center justify-center gap-4 w-full h-[calc(100vh-64px)]'>
        <h1>Welcome to the Dreamworld</h1>
        <h1>Type Your Dreamworld</h1>
        <textarea cols={60} rows={10} className='border p-4 resize-none' placeholder='i dream a world where lives a dragon'> </textarea>
      </div>
    </div>
  )
}

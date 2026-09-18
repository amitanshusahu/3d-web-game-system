import { createFileRoute, Link, useRouter } from '@tanstack/react-router'
import { useEffect } from 'react'
import { BorderBeam } from 'border-beam'

export const Route = createFileRoute('/')({
  component: LandingPage,
})

function LandingPage() {
  const router = useRouter()

  // if already logged in, redirect to /chat/new
  useEffect(() => {
    if (localStorage.getItem('token')) router.navigate({ to: '/chat/new' })
  })

  const imgLinks = [
    "/img/bg.png",
    "https://w.wallhaven.cc/full/6l/wallhaven-6ly7yw.png",
    "https://w.wallhaven.cc/full/7j/wallhaven-7jxgpo.png",
    "https://w.wallhaven.cc/full/ml/wallhaven-mlyx18.jpg",
    "https://w.wallhaven.cc/full/qr/wallhaven-qrow67.png",
    "https://w.wallhaven.cc/full/zp/wallhaven-zpo9ew.png",
    "https://w.wallhaven.cc/full/43/wallhaven-438w60.jpg",
    "https://w.wallhaven.cc/full/gp/wallhaven-gpgyw3.jpg",
    "https://w.wallhaven.cc/full/yx/wallhaven-yx6dyk.jpg",
    "https://w.wallhaven.cc/full/ml/wallhaven-mlw82k.png",
    "https://w.wallhaven.cc/full/g8/wallhaven-g8dm6e.jpg"
  ]

  return (
    <div className='w-full min-h-screen bg-black/10 text-white'>
      <img src={imgLinks[8]} className='fixed top-0 left-0 w-full h-full object-cover z-[-1]' />
      <div className='flex justify-between w-full gap-4 p-6 px-12'>
        <div>logo</div>
        <div className='flex gap-4'>
          <Link to='/auth/login' className='rounded-lg border border-white/20 px-4 py-2 hover:bg-white/10'>
            login
          </Link>
          <Link to='/auth/signup' className='rounded-lg bg-white px-4 py-2 text-black hover:bg-white/80'>
            signup
          </Link>
        </div>
      </div>
      <div className='flex flex-col items-start justify-end gap-20 w-full h-[calc(100vh-100px)] p-6 px-12'>
        <div>
          <h1 className='text-9xl font-bold'>Dreamworld</h1>
          <h2 className='text-5xl font-semibold italic text-cyan-500'>dream. live.</h2>
        </div>
        <div className="flex justify-between w-full gap-4 items-end">
          <BorderBeam size="line" colorVariant="mono">
            <textarea cols={50} rows={5} className='p-4 resize-none rounded-lg bg-[#111111b9] border border-white/20 text-lg' placeholder='i dream a world where lives a dragon...' />
          </BorderBeam>

          <div className="flex">
            github
          </div>
        </div>
      </div>
    </div>
  )
}

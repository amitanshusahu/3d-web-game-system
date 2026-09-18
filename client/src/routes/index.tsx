import { createFileRoute, Link, redirect } from '@tanstack/react-router'
import { LandingChatBox } from '../components/landing/LandingChatBox'
import { getToken } from '../lib/auth'


export const Route = createFileRoute('/')({
  beforeLoad: () => {
    if (getToken()) {
      throw redirect({ to: '/chat/new' })
    }
  },
  component: LandingPage,
})

function LandingPage() {

  const imgLinks = [
    "/img/bg.jpg",
    "https://w.wallhaven.cc/full/yx/wallhaven-yx6dyk.jpg",
    "https://w.wallhaven.cc/full/85/wallhaven-85xjy1.jpg",
    "https://w.wallhaven.cc/full/vp/wallhaven-vpeew3.jpg",
  ]

  return (
    <div className='relative flex min-h-screen flex-col overflow-hidden bg-black text-white'>
      <img
        src={imgLinks[0]}
        alt=''
        aria-hidden='true'
        className='pointer-events-none fixed inset-0 h-full w-full object-cover'
      />
      <div className='pointer-events-none fixed inset-0 bg-gradient-to-r from-black/100 via-black/5 to-transparent' />
      {/* <div className='pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_40%,transparent_0%,rgba(0,0,0,0.5)_100%)]' /> */}

      <header className='relative z-10 flex items-center justify-between px-5 py-5 sm:px-10'>
        <Link to='/' className='flex items-center gap-2.5'>
          <span className='flex h-8 w-8 items-center justify-center rounded-lg bg-white text-base text-black'>
            ✦
          </span>
          <span className='text-lg font-semibold tracking-tight'>Dreamworld</span>
        </Link>
        <nav className='flex items-center gap-2 sm:gap-3'>
          <Link
            to='/auth/login'
            className='rounded-full border border-white/20 bg-white/5 px-4 py-2 text-sm font-medium text-white backdrop-blur transition hover:border-white/40 hover:bg-white/10'
          >
            Log in
          </Link>
          <Link
            to='/auth/signup'
            className='rounded-full bg-white px-4 py-2 text-sm font-semibold text-black transition hover:bg-cyan-100'
          >
            Start dreaming
          </Link>
        </nav>
      </header>

      <main className='relative z-10 mx-auto flex w-full  flex-1 flex-col items-start justify-end px-5 pb-16 pt-8 text-left sm:px-8'>
        <p className='mb-5 inline-flex items-center gap-2  text-xs font-medium text-white/70 backdrop-blur'>
          
        </p>
        <h1 className='text-5xl font-bold leading-[0.95] tracking-tight sm:text-7xl lg:text-8xl'>
          Dreamworld
        </h1>
        <p className='mt-3 text-blue-400 text-3xl font-semibold italic sm:text-5xl'>
          dream ✦ live ✦
        </p>
        <p className='mt-5 max-w-xl text-balance text-sm leading-relaxed text-white/60 sm:text-base'>
          Type a dream, wake up inside a playable 3D world. AI builds the terrain, places the creatures, and drops
          you in, ready to walk around.
        </p>

        <div className='flex justify-between w-full items-end'>
          <div className='mt-12 w-full max-w-2xl'>
            <LandingChatBox hideSuggestion={false} />
          </div>
          <a
            href='https://github.com'
            target='_blank'
            rel='noreferrer'
            className='ml-auto flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 backdrop-blur transition hover:border-white/30 hover:text-white'
          >
            <svg width='14' height='14' viewBox='0 0 24 24' fill='currentColor' aria-hidden='true'>
              <path d='M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.55v-2.15c-3.2.7-3.87-1.36-3.87-1.36-.52-1.33-1.28-1.68-1.28-1.68-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.19 1.76 1.19 1.03 1.76 2.7 1.25 3.36.96.1-.75.4-1.25.72-1.54-2.55-.29-5.23-1.28-5.23-5.68 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11.1 11.1 0 0 1 5.8 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.83 1.19 3.09 0 4.41-2.69 5.38-5.25 5.67.41.35.77 1.05.77 2.12v3.14c0 .3.21.67.8.55A11.51 11.51 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z' />
            </svg>
            GitHub
          </a>
        </div>
      </main>
    </div>
  )
}

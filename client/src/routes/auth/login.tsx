import { createFileRoute, Link, redirect } from '@tanstack/react-router'
import { useState, type FormEvent } from 'react'
import z from 'zod'
import GoogleSignInButton from '../../components/auth/GoogleSignInButton'
import { useLogin } from '../../hooks/useAuth'
import { getApiErrorMessage } from '../../lib/api'
import { getToken } from '../../lib/auth'
import { loginSchema } from '../../sharedTypes/auth/auth.model'

export const Route = createFileRoute('/auth/login')({
  beforeLoad: () => {
    if (getToken()) {
      throw redirect({ to: '/chat/new' })
    }
  },
  component: LoginPage,
})

function LoginPage() {
  const login = useLogin()
  const [form, setForm] = useState({ email: '', password: '' })
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const parsed = loginSchema.safeParse(form)
    if (!parsed.success) {
      const { fieldErrors: zodFieldErrors } = z.flattenError(parsed.error)
      const nextErrors: Record<string, string> = {}
      for (const [key, messages] of Object.entries(zodFieldErrors)) {
        if (messages && messages.length > 0) nextErrors[key] = messages[0]
      }
      setFieldErrors(nextErrors)
      return
    }
    setFieldErrors({})
    login.mutate(parsed.data)
  }

  return (
    <div className='relative flex min-h-screen flex-col overflow-hidden bg-black text-white'>
      <img
        src='/img/bg.jpg'
        alt=''
        aria-hidden='true'
        className='pointer-events-none fixed inset-0 h-full w-full object-cover'
      />
      <div className='pointer-events-none fixed inset-0 bg-gradient-to-r from-black/100 via-black/5 to-transparent' />

      <header className='relative z-10 flex items-center justify-between px-5 py-5 sm:px-10'>
        <Link to='/' className='flex items-center gap-2.5'>
          <span className='flex h-8 w-8 items-center justify-center rounded-lg bg-white text-base text-black'>
            ✦
          </span>
          <span className='text-lg font-semibold tracking-tight'>Dreamworld</span>
        </Link>
        <nav className='flex items-center gap-2 sm:gap-3'>
          <Link
            to='/auth/signup'
            className='rounded-full bg-white px-4 py-2 text-sm font-semibold text-black transition hover:bg-cyan-100'
          >
            Start dreaming
          </Link>
        </nav>
      </header>

      <main className='relative z-10 mx-auto flex w-full flex-1 flex-col items-center justify-center gap-12 px-5 pb-16 pt-8 sm:px-10 lg:flex-row lg:justify-between'>
        <div className='w-[500px] flex flex-col items-start gap-12 text-left lg:max-w-lg'>
          {/* <div className='w-full max-w-xl text-left'>
            <h1 className='text-5xl font-bold leading-[0.95] tracking-tight sm:text-7xl'>
              Dreamworld
            </h1>
            <p className='mt-3 text-3xl font-semibold italic text-blue-400 sm:text-4xl'>
              dream ✦ live ✦
            </p>
          </div> */}

          <div className='w-full max-w-md rounded-2xl border border-white/15 bg-black/50 p-6 shadow-2xl shadow-black/50 backdrop-blur-xl sm:p-8'>
            <div className='flex flex-col gap-1'>
              <h2 className='text-2xl font-semibold tracking-tight'>Welcome back</h2>
              <p className='text-sm text-white/50'>Log in to your dreamworld</p>
            </div>

            <form onSubmit={handleSubmit} className='mt-6 flex flex-col gap-4'>
              <div className='flex flex-col gap-1'>
                <input
                  type='email'
                  placeholder='email'
                  value={form.email}
                  onChange={(event) => setForm({ ...form, email: event.target.value })}
                  className='w-full rounded-lg border border-white/15 bg-white/5 px-4 py-2.5 outline-none placeholder-white/40 backdrop-blur transition focus:border-blue-400/60 focus:bg-white/10'
                />
                {fieldErrors.email && <p className='text-xs text-red-400'>{fieldErrors.email}</p>}
              </div>
              <div className='flex flex-col gap-1'>
                <input
                  type='password'
                  placeholder='password'
                  value={form.password}
                  onChange={(event) => setForm({ ...form, password: event.target.value })}
                  className='w-full rounded-lg border border-white/15 bg-white/5 px-4 py-2.5 outline-none placeholder-white/40 backdrop-blur transition focus:border-blue-400/60 focus:bg-white/10'
                />
                {fieldErrors.password && (
                  <p className='text-xs text-red-400'>{fieldErrors.password}</p>
                )}
              </div>
              {login.isError && (
                <p className='text-sm text-red-400'>{getApiErrorMessage(login.error)}</p>
              )}
              <button
                type='submit'
                disabled={login.isPending}
                className='rounded-full bg-white py-2.5 text-sm font-semibold text-black transition hover:bg-cyan-100 disabled:opacity-50'
              >
                {login.isPending ? 'Logging in…' : 'Log in'}
              </button>
            </form>

            <div className='my-6 flex items-center gap-3 text-xs text-white/30'>
              <span className='h-px flex-1 bg-white/15' />
              or
              <span className='h-px flex-1 bg-white/15' />
            </div>

            <GoogleSignInButton />

            <p className='mt-6 text-center text-sm text-white/50'>
              No account?{' '}
              <Link
                to='/auth/signup'
                className='font-medium text-white underline underline-offset-4 hover:text-blue-300'
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}

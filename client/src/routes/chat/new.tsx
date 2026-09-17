import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/chat/new')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className='w-full min-h-screen bg-black text-white flex flex-col items-center justify-center gap-4'>
      <h1>Type Your Dreamworld</h1>
      <textarea cols={60} rows={10} className='border p-4 resize-none' placeholder='i dream a world where lives a dragon'> </textarea>
    </div>
  )
}

import { createFileRoute } from '@tanstack/react-router'
import AvatarFrame from '../components/ui/Hud/AvatarFrame'

export const Route = createFileRoute('/svg')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 bg-black w-screen h-screen">
      <AvatarFrame className="w-32" imgSrc="/img/avatar/skeleton-dragon.webp" />
    </div>
  )
}

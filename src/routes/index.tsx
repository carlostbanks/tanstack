import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: IndexRoute,
})

function IndexRoute() {
  return (
    <div className="bg-paper text-ink min-h-screen p-8 font-sans">
      Wayfare — shell
    </div>
  )
}

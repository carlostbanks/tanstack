import { createFileRoute } from '@tanstack/react-router'
import { CardGrid } from '../components/CardGrid'
import { TripHeader } from '../components/TripHeader'
import { mockItems, mockTrip } from '../data/mockTrip'

export const Route = createFileRoute('/')({
  component: IndexRoute,
})

function IndexRoute() {
  return (
    <>
      <TripHeader trip={mockTrip} items={mockItems} />
      <CardGrid items={mockItems} />
    </>
  )
}

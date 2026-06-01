import type { Item, Trip } from '../types'

const monthDayFmt = new Intl.DateTimeFormat('en-US', {
  timeZone: 'UTC',
  month: 'short',
  day: 'numeric',
})

const yearFmt = new Intl.DateTimeFormat('en-US', {
  timeZone: 'UTC',
  year: 'numeric',
})

function formatDateRange(startDate: string, endDate: string): string {
  const start = new Date(startDate)
  const end = new Date(endDate)
  return `${monthDayFmt.format(start)} – ${monthDayFmt.format(end)}, ${yearFmt.format(end)}`
}

function formatPlannedTotal(items: Item[]): string {
  const total = items.reduce((sum, i) => sum + (i.plannedCostUsd ?? 0), 0)
  return `$${total.toLocaleString('en-US')}`
}

export function TripHeader({ trip, items }: { trip: Trip; items: Item[] }) {
  return (
    <header className="mb-8">
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <div className="font-mono text-[11px] tracking-[0.3em] uppercase text-terra mb-1">
            Wayfare
          </div>
          <h1 className="font-display text-5xl sm:text-6xl font-semibold leading-none tracking-tight">
            {trip.name}
          </h1>
          <p className="text-ink2 mt-2 text-sm">
            {formatDateRange(trip.startDate, trip.endDate)} · {items.length} items ·{' '}
            <span className="font-mono text-ink">{formatPlannedTotal(items)}</span> planned
          </p>
        </div>
        <nav className="flex gap-1 bg-paper2 p-1 rounded-full border border-line">
          <button
            type="button"
            className="px-4 py-1.5 rounded-full bg-ink text-paper text-sm font-medium"
          >
            Paris
          </button>
          <button
            type="button"
            className="px-4 py-1.5 rounded-full text-ink2 text-sm font-medium hover:text-ink"
          >
            New York
          </button>
        </nav>
      </div>
      <div className="mt-6 flex items-center gap-2 flex-wrap">
        <span className="text-xs text-ink2 mr-1">View</span>
        <div className="flex gap-1 text-sm font-medium border border-line rounded-lg overflow-hidden">
          <button type="button" className="px-3 py-1.5 bg-ink text-paper">
            Cards
          </button>
          <button type="button" className="px-3 py-1.5 text-ink2 hover:text-ink">
            Agenda
          </button>
        </div>
        <button
          type="button"
          className="ml-auto text-sm font-medium text-terra border border-terra/40 px-3 py-1.5 rounded-lg hover:bg-terra/10"
        >
          Budget →
        </button>
      </div>
    </header>
  )
}

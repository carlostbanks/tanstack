import type { Item, ItemType } from '../types'

const typeMeta: Record<
  ItemType,
  { label: string; accentText: string; codeLabel: string }
> = {
  flight: { label: 'Flight', accentText: 'text-flight', codeLabel: 'PNR' },
  train: { label: 'Train', accentText: 'text-train', codeLabel: 'REF' },
  hotel: { label: 'Hotel', accentText: 'text-hotel', codeLabel: 'CONF' },
  activity: { label: 'Activity', accentText: 'text-activity', codeLabel: 'TKT' },
  restaurant: { label: 'Restaurant', accentText: 'text-food', codeLabel: 'RES' },
}

// e-Ticket is the only status that uses the brown chip in the preview;
// every other status uses the green (train) chip.
const statusChipClass = (status: string) =>
  status === 'e-Ticket' ? 'text-hotel bg-hotel/10' : 'text-train bg-train/10'

function TypeIcon({ type }: { type: ItemType }) {
  switch (type) {
    case 'flight':
      return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M17.8 19.2 16 11l3.5-3.5a2 2 0 0 0-2.8-2.8L13 8.2 4.8 6.4a1 1 0 0 0-.9 1.7l5.3 3.7-1.2 3.2-2.3-.6a1 1 0 0 0-1 1.5l1.9 2.8L9 23a1 1 0 0 0 1.5-1l-.6-2.3 3.2-1.2 3.7 5.3a1 1 0 0 0 1.7-.9z" />
        </svg>
      )
    case 'hotel':
      return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 21V7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v14M3 21h18M7 9h2m6 0h2M7 13h2m6 0h2M9 21v-4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v4" />
        </svg>
      )
    case 'train':
      return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="4" y="4" width="16" height="12" rx="2" />
          <path d="M4 11h16M8 20l-2 2m12-2 2 2M8.5 16h.01M15.5 16h.01" />
        </svg>
      )
    case 'activity':
      return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 3 2 9l10 6 10-6-10-6zM2 9v6l10 6 10-6V9" />
        </svg>
      )
    case 'restaurant':
      return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M4 3v7a2 2 0 0 0 2 2h0v9M6 3v6m-2-6v6m14-6c-1.5 0-3 1.5-3 4s1.5 4 3 5v6" />
        </svg>
      )
  }
}

const dateTimeFmt = new Intl.DateTimeFormat('en-US', {
  timeZone: 'UTC',
  month: 'short',
  day: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
  hour12: true,
})

const monthDayFmt = new Intl.DateTimeFormat('en-US', {
  timeZone: 'UTC',
  month: 'short',
  day: 'numeric',
})

const dayFmt = new Intl.DateTimeFormat('en-US', {
  timeZone: 'UTC',
  day: 'numeric',
})

function subtitleFor(item: Item): string {
  const start = new Date(item.startAt)
  if (item.type === 'hotel' && item.endAt) {
    const end = new Date(item.endAt)
    const nights = Math.round(
      (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24),
    )
    return `${nights} night${nights === 1 ? '' : 's'} · ${monthDayFmt.format(start)} – ${dayFmt.format(end)}`
  }
  const dateText = dateTimeFmt.format(start)
  return item.notes ? `${item.notes} · ${dateText}` : dateText
}

function formatCost(item: Item): string | null {
  if (item.plannedCostUsd == null) return null
  return `$${item.plannedCostUsd.toLocaleString('en-US')}`
}

export function Card({ item }: { item: Item }) {
  const meta = typeMeta[item.type]
  const cost = formatCost(item)
  return (
    <article className="group bg-white/70 border border-line rounded-2xl p-5 hover:-translate-y-1 hover:shadow-[0_12px_30px_-12px_#1f1b1633] transition cursor-pointer">
      <div className="flex items-center justify-between mb-4">
        <span
          className={`inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider ${meta.accentText}`}
        >
          <TypeIcon type={item.type} />
          {meta.label}
        </span>
        <span
          className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${statusChipClass(item.status)}`}
        >
          {item.status}
        </span>
      </div>
      <h3 className="font-display text-xl font-semibold leading-snug">{item.title}</h3>
      <p className="text-sm text-ink2 mt-1">{subtitleFor(item)}</p>
      {cost && <p className="font-mono text-base font-medium mt-2">{cost}</p>}
      <div className="perf mt-4 pt-3 flex items-center justify-between">
        {item.confirmationCode ? (
          <span className="font-mono text-xs text-ink2">
            {meta.codeLabel} <span className="text-ink">{item.confirmationCode}</span>
          </span>
        ) : (
          <span />
        )}
        <span className="text-xs text-terra font-medium group-hover:translate-x-0.5 transition">
          Details →
        </span>
      </div>
    </article>
  )
}

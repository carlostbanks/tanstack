import type { Item } from '../types'
import { Card } from './Card'

export function CardGrid({ items, onAdd }: { items: Item[]; onAdd?: () => void }) {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {items.map((item) => (
        <Card key={item.id} item={item} />
      ))}
      <button
        type="button"
        onClick={onAdd}
        className="border-2 border-dashed border-line rounded-2xl p-5 flex flex-col items-center justify-center text-ink2 hover:border-terra hover:text-terra transition min-h-[180px]"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 5v14M5 12h14" />
        </svg>
        <span className="text-sm font-medium mt-2">Add booking</span>
      </button>
    </div>
  )
}

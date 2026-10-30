import { useMemo, useState } from 'react'
import { LuChevronLeft, LuChevronRight } from 'react-icons/lu'
import type { Entry } from '../types'
import { dateKeyForTimestamp } from '../lib'
import { IconButton } from './ui'

interface Props {
  entries: Entry[]
  selectedDate: string | null
  onSelectDate: (date: string) => void
}

export function MiniCalendar({ entries, selectedDate, onSelectDate }: Props) {
  const [month, setMonth] = useState(() => {
    const today = new Date()
    return new Date(today.getFullYear(), today.getMonth(), 1)
  })
  const entryCounts = useMemo(() => {
    const counts = new Map<string, number>()
    for (const entry of entries) {
      const key = dateKeyForTimestamp(entry.createdAt)
      counts.set(key, (counts.get(key) ?? 0) + 1)
    }
    return counts
  }, [entries])
  const firstWeekday = (month.getDay() + 6) % 7
  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate()
  const cellCount = Math.ceil((firstWeekday + daysInMonth) / 7) * 7
  const cells = Array.from({ length: cellCount }, (_, index) => {
    const day = index - firstWeekday + 1
    return day > 0 && day <= daysInMonth ? day : null
  })
  const todayKey = dateKeyForTimestamp(Date.now())
  const monthLabel = month.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
  const weekdays = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

  const shiftMonth = (amount: number) => {
    setMonth((current) => new Date(current.getFullYear(), current.getMonth() + amount, 1))
  }

  return (
    <section className="mt-6 px-1" aria-label="Entry calendar">
      <div className="mb-3 flex items-center justify-between gap-1">
        <IconButton label="Previous month" onClick={() => shiftMonth(-1)} className="h-7 w-7">
          <LuChevronLeft size={15} />
        </IconButton>
        <h2 className="text-xs font-medium text-bone-300">{monthLabel}</h2>
        <IconButton label="Next month" onClick={() => shiftMonth(1)} className="h-7 w-7">
          <LuChevronRight size={15} />
        </IconButton>
      </div>
      <div className="grid grid-cols-7 gap-y-1 text-center">
        {weekdays.map((weekday, index) => (
          <span key={`${weekday}-${index}`} className="py-1 text-[10px] text-bone-600" aria-hidden="true">
            {weekday}
          </span>
        ))}
        {cells.map((day, index) => {
          if (day === null) return <span key={`empty-${index}`} />
          const date = new Date(month.getFullYear(), month.getMonth(), day)
          const key = dateKeyForTimestamp(date.getTime())
          const count = entryCounts.get(key) ?? 0
          const monthName = date.toLocaleDateString(undefined, { month: 'long' })
          return (
            <button
              key={key}
              type="button"
              aria-label={`${day} ${monthName}, ${count} ${count === 1 ? 'entry' : 'entries'}`}
              aria-current={key === todayKey ? 'date' : undefined}
              aria-pressed={selectedDate === key}
              onClick={() => onSelectDate(key)}
              className={`relative mx-auto grid h-7 w-7 place-items-center rounded-full text-[11px] transition ${
                selectedDate === key
                  ? 'bg-sand text-ink-950'
                  : key === todayKey
                    ? 'ring-1 ring-bone-600 text-bone-100'
                    : 'text-bone-500 hover:bg-ink-800 hover:text-bone-100'
              }`}
            >
              {day}
              {count > 0 && (
                <span
                  className={`absolute -bottom-0.5 h-1 w-1 rounded-full ${
                    selectedDate === key ? 'bg-ink-950' : 'bg-sand'
                  }`}
                />
              )}
            </button>
          )
        })}
      </div>
    </section>
  )
}

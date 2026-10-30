import { LuPenLine } from 'react-icons/lu'
import type { Entry } from '../types'
import { excerpt, greeting, longDate, onThisDayEntry, streakStats, wordCount, wordsPerDay, wordsThisWeek } from '../lib'
import { Button, EmptyState, EntryRow } from './ui'

interface Props {
  entries: Entry[]
  onOpen: (id: string) => void
  onNew: () => void
  onAll: () => void
}

export function Dashboard({ entries, onOpen, onNew, onAll }: Props) {
  const recent = [...entries]
    .sort((a, b) => Number(b.pinned) - Number(a.pinned) || b.createdAt - a.createdAt)
    .slice(0, 5)
  const words = entries.reduce((n, e) => n + wordCount(e.body), 0)
  const now = new Date()
  const streak = streakStats(entries, now)
  const thisWeek = wordsThisWeek(entries, now)
  const dailyWords = wordsPerDay(entries, now)
  const maxDailyWords = Math.max(1, ...dailyWords.map((day) => day.words))
  const memory = onThisDayEntry(entries, now)
  const chartWidth = 308
  const chartHeight = 68
  const barWidth = 12
  const gap = 9
  return (
    <div className="mx-auto w-full max-w-6xl px-6 pb-24 pt-10 md:pt-20">
      <p className="text-sm text-bone-500">{longDate()}</p>
      <h1 className="mt-3 font-serif text-4xl tracking-tight md:text-5xl">{greeting()}</h1>
      <p className="mt-3 font-serif text-lg text-bone-500">What’s on your mind today?</p>
      <div className="mt-8 flex items-center gap-4">
        <Button variant="primary" icon={<LuPenLine size={16} />} onClick={onNew}>
          Start writing
        </Button>
        {entries.length > 0 && (
          <span className="text-sm text-bone-600">
            {entries.length} {entries.length === 1 ? 'entry' : 'entries'} · {words.toLocaleString()} words
          </span>
        )}
      </div>

      {entries.length > 0 && (
        <section className="mt-10 grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-ink-800 bg-ink-900/60 p-4">
            <p className="text-xs text-bone-600">Current streak</p>
            <p className="mt-2 font-serif text-2xl text-bone-100">
              {streak.current} <span className="text-sm text-bone-500">{streak.current === 1 ? 'day' : 'days'}</span>
            </p>
          </div>
          <div className="rounded-xl border border-ink-800 bg-ink-900/60 p-4">
            <p className="text-xs text-bone-600">Longest streak</p>
            <p className="mt-2 font-serif text-2xl text-bone-100">
              {streak.longest} <span className="text-sm text-bone-500">{streak.longest === 1 ? 'day' : 'days'}</span>
            </p>
          </div>
          <div className="rounded-xl border border-ink-800 bg-ink-900/60 p-4">
            <p className="text-xs text-bone-600">Words this week</p>
            <p className="mt-2 font-serif text-2xl text-bone-100">{thisWeek.toLocaleString()}</p>
          </div>
        </section>
      )}

      {entries.length > 0 && (
        <section className="mt-4 rounded-xl border border-ink-800 bg-ink-900/60 p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-medium text-bone-300">Words · last 14 days</h2>
            <span className="text-[10px] text-bone-600">14 days ago · today</span>
          </div>
          <svg
            viewBox={`0 0 ${chartWidth} ${chartHeight + 4}`}
            className="h-20 w-full overflow-visible"
            role="img"
            aria-label={`Words written per day over the last 14 days. ${dailyWords.map((day) => `${day.date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}: ${day.words}`).join('; ')}`}
            preserveAspectRatio="none"
          >
            <title>Words written per day over the last 14 days</title>
            <path d={`M1 ${chartHeight + 1} Q78 ${chartHeight - 1} 154 ${chartHeight + 1} T${chartWidth - 1} ${chartHeight + 1}`} fill="none" stroke="#2b2b29" strokeWidth="1" />
            {dailyWords.map((day, index) => {
              const height = day.words ? Math.max(3, (day.words / maxDailyWords) * 48) : 2
              const x = index * (barWidth + gap) + 2
              const y = chartHeight - height
              return (
                <path
                  key={day.key}
                  d={`M${x + 1} ${chartHeight} L${x} ${y + 2} Q${x + 3} ${y} ${x + 6} ${y + 1} L${x + barWidth - 1} ${y} L${x + barWidth} ${chartHeight - 1} L${x + 2} ${chartHeight + 1} Z`}
                  fill={day.words ? '#c8b88f' : '#3a3a37'}
                  opacity={day.words ? 0.45 + (day.words / maxDailyWords) * 0.55 : 0.6}
                >
                  <title>{`${day.date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}: ${day.words} words`}</title>
                </path>
              )
            })}
          </svg>
        </section>
      )}

      {memory && (
        <button
          type="button"
          onClick={() => onOpen(memory.id)}
          className="mt-8 block w-full rounded-xl border border-ink-800 bg-ink-900/40 px-5 py-4 text-left transition hover:border-ink-700 hover:bg-ink-900"
        >
          <span className="text-xs text-bone-600">On this day · {new Date(memory.createdAt).getFullYear()}</span>
          <span className="mt-1 block font-serif text-lg text-bone-300">{memory.title.trim() || 'Untitled'}</span>
          {excerpt(memory.body, 180) && (
            <span className="mt-1 block line-clamp-2 font-serif text-sm leading-relaxed text-bone-600">
              {excerpt(memory.body, 180)}
            </span>
          )}
        </button>
      )}

      <section className="mt-16">
        <div className="mb-3 flex items-center justify-between px-4">
          <h2 className="text-sm font-medium text-bone-300">Recent entries</h2>
          {entries.length > 5 && (
            <button onClick={onAll} className="text-sm text-bone-500 transition hover:text-bone-100">
              View all
            </button>
          )}
        </div>
        {recent.length === 0 ? (
          <EmptyState title="A blank page" text="Your entries will appear here. Write the first one whenever you’re ready." />
        ) : (
          <div className="space-y-1">
            {recent.map((e) => (
              <EntryRow key={e.id} entry={e} onOpen={() => onOpen(e.id)} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

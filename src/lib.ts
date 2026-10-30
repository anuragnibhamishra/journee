import type { Entry } from './types'

export const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8)

const sameDay = (a: Date, b: Date) => a.toDateString() === b.toDateString()

export function dayLabel(ts: number): string {
  const d = new Date(ts)
  const now = new Date()
  const yesterday = new Date()
  yesterday.setDate(now.getDate() - 1)
  if (sameDay(d, now)) return 'Today'
  if (sameDay(d, yesterday)) return 'Yesterday'
  return d.toLocaleDateString(undefined, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    ...(d.getFullYear() !== now.getFullYear() ? { year: 'numeric' as const } : {}),
  })
}

export const timeLabel = (ts: number) =>
  new Date(ts).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })

export const longDate = (ts = Date.now()) =>
  new Date(ts).toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

export function greeting(): string {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning.'
  if (h < 18) return 'Good afternoon.'
  return 'Good evening.'
}

export const wordCount = (s: string) => (s.trim() ? s.trim().split(/\s+/).length : 0)
export const excerpt = (s: string, n = 160) => s.replace(/\s+/g, ' ').trim().slice(0, n)

export function dateKey(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function dateKeyForTimestamp(timestamp: number): string {
  return dateKey(new Date(timestamp))
}

export function streakStats(entries: Entry[], now: Date): { current: number; longest: number } {
  const days = new Set(entries.map((entry) => dateKeyForTimestamp(entry.createdAt)))
  const sortedDays = [...days].sort()
  let longest = 0
  let run = 0
  let previous: Date | undefined

  for (const key of sortedDays) {
    const [year, month, day] = key.split('-').map(Number)
    const currentDay = new Date(year, month - 1, day)
    const expectedDay = previous ? new Date(previous) : undefined
    expectedDay?.setDate(expectedDay.getDate() + 1)
    const consecutive = expectedDay !== undefined && dateKey(expectedDay) === key
    run = consecutive ? run + 1 : 1
    longest = Math.max(longest, run)
    previous = currentDay
  }

  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  let cursor = new Date(today)
  if (!days.has(dateKey(cursor))) cursor.setDate(cursor.getDate() - 1)
  let current = 0
  while (days.has(dateKey(cursor))) {
    current += 1
    cursor.setDate(cursor.getDate() - 1)
  }

  return { current, longest }
}

export function wordsThisWeek(entries: Entry[], now: Date): number {
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const daysSinceMonday = (start.getDay() + 6) % 7
  start.setDate(start.getDate() - daysSinceMonday)
  return entries.reduce(
    (total, entry) =>
      entry.createdAt >= start.getTime() && entry.createdAt <= now.getTime()
        ? total + wordCount(entry.body)
        : total,
    0,
  )
}

export function wordsPerDay(
  entries: Entry[],
  now: Date,
  count = 14,
): { key: string; date: Date; words: number }[] {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const days = Array.from({ length: count }, (_, index) => {
    const date = new Date(today)
    date.setDate(today.getDate() - (count - index - 1))
    return { key: dateKey(date), date, words: 0 }
  })
  const byKey = new Map(days.map((day) => [day.key, day]))
  for (const entry of entries) {
    const day = byKey.get(dateKeyForTimestamp(entry.createdAt))
    if (day) day.words += wordCount(entry.body)
  }
  return days
}

export function onThisDayEntry(entries: Entry[], now: Date): Entry | undefined {
  return entries
    .filter((entry) => {
      const date = new Date(entry.createdAt)
      return date.getFullYear() < now.getFullYear() && date.getMonth() === now.getMonth() && date.getDate() === now.getDate()
    })
    .sort((a, b) => b.createdAt - a.createdAt)[0]
}

export function downloadTextFile(filename: string, content: string, type: string): void {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export function entryMarkdown(entry: Entry): string {
  const title = entry.title.trim() || 'Untitled'
  const date = longDate(entry.createdAt)
  const metadata = [
    `Date: ${date}`,
    ...(entry.mood ? [`Mood: ${entry.mood}/5`] : []),
    ...(entry.tags.length ? [`Tags: ${entry.tags.join(', ')}`] : []),
  ]
  return `# ${title}\n\n${metadata.join(' · ')}\n\n${entry.body}\n`
}

export function entryMarkdownFilename(entry: Entry): string {
  const slug = (entry.title.trim() || 'untitled')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
  return `${slug || 'entry'}.md`
}

export function groupByDay(entries: Entry[]): { label: string; items: Entry[] }[] {
  const groups: { label: string; items: Entry[] }[] = []
  for (const e of entries) {
    const label = dayLabel(e.createdAt)
    const last = groups[groups.length - 1]
    if (last && last.label === label) last.items.push(e)
    else groups.push({ label, items: [e] })
  }
  return groups
}

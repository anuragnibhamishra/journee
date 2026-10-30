import { useEffect, useMemo, useRef, useState } from 'react'
import { LuSearch, LuX } from 'react-icons/lu'
import type { Entry } from '../types'
import { dateKeyForTimestamp, groupByDay } from '../lib'
import { Button, EmptyState, EntryRow, IconButton } from './ui'

interface Props {
  entries: Entry[]
  onOpen: (id: string) => void
  onNew: () => void
  focusSearchRequest: number
  selectedDate: string | null
  onClearDate: () => void
}

function dateChipLabel(key: string): string {
  const [year, month, day] = key.split('-').map(Number)
  return new Date(year, month - 1, day).toLocaleDateString(undefined, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  })
}

export function Entries({ entries, onOpen, onNew, focusSearchRequest, selectedDate, onClearDate }: Props) {
  const [query, setQuery] = useState('')
  const [search, setSearch] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [selectedMood, setSelectedMood] = useState<Entry['mood']>()
  const searchInput = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const timer = setTimeout(() => setSearch(query.trim()), 200)
    return () => clearTimeout(timer)
  }, [query])

  useEffect(() => {
    if (focusSearchRequest > 0) searchInput.current?.focus()
  }, [focusSearchRequest])

  const allTags = useMemo(
    () => [...new Set(entries.flatMap((entry) => entry.tags))].sort((a, b) => a.localeCompare(b)),
    [entries],
  )
  const filtered = useMemo(() => {
    const term = search.toLowerCase()
    return entries.filter((entry) => {
      const matchesSearch =
        !term || (entry.title + ' ' + entry.body + ' ' + entry.tags.join(' ')).toLowerCase().includes(term)
      const matchesDate = !selectedDate || dateKeyForTimestamp(entry.createdAt) === selectedDate
      const matchesTags = selectedTags.every((tag) => entry.tags.includes(tag))
      const matchesMood = selectedMood === undefined || entry.mood === selectedMood
      return matchesSearch && matchesDate && matchesTags && matchesMood
    })
  }, [entries, search, selectedDate, selectedTags, selectedMood])
  const groups = useMemo(() => groupByDay(filtered), [filtered])
  const hasFilters = Boolean(query.trim() || selectedTags.length || selectedMood || selectedDate)

  const clearFilters = () => {
    setQuery('')
    setSearch('')
    setSelectedTags([])
    setSelectedMood(undefined)
    onClearDate()
  }

  const toggleTag = (tag: string) => {
    setSelectedTags((current) =>
      current.includes(tag) ? current.filter((value) => value !== tag) : [...current, tag],
    )
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-6 pb-24 pt-10 md:pt-16">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-serif text-3xl tracking-tight">All entries</h1>
        {hasFilters && (
          <Button onClick={clearFilters} className="text-xs text-bone-500">
            Clear filters
          </Button>
        )}
      </div>
      {selectedDate && (
        <button
          type="button"
          onClick={onClearDate}
          aria-label={`Clear date filter for ${dateChipLabel(selectedDate)}`}
          className="mt-4 inline-flex items-center gap-2 rounded-full border border-ink-700 bg-ink-900 px-3 py-1.5 text-xs text-bone-300 transition hover:border-ink-600"
        >
          Showing {dateChipLabel(selectedDate)}
          <LuX size={13} className="text-bone-500" />
        </button>
      )}
      <div className="mt-5 flex items-center gap-3 rounded-xl border border-ink-700 bg-ink-900 px-4 transition duration-150 focus-within:border-bone-600">
        <LuSearch size={17} className="text-bone-600" />
        <input
          ref={searchInput}
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search titles and writing"
          className="h-11 w-full text-sm"
        />
        {query && (
          <IconButton label="Clear search" onClick={() => setQuery('')} className="-mr-2 h-7 w-7">
            <LuX size={15} />
          </IconButton>
        )}
      </div>

      {allTags.length > 0 && (
        <div className="mt-5">
          <p className="mb-2 text-xs text-bone-600">Tags</p>
          <div className="flex flex-wrap gap-2">
            {allTags.map((tag) => (
              <button
                key={tag}
                type="button"
                aria-pressed={selectedTags.includes(tag)}
                onClick={() => toggleTag(tag)}
                className={`rounded-full border px-3 py-1 text-xs transition ${
                  selectedTags.includes(tag)
                    ? 'border-sand/50 bg-sand/10 text-sand'
                    : 'border-ink-700 text-bone-500 hover:border-ink-600 hover:text-bone-300'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      )}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="mr-1 text-xs text-bone-600">Mood</span>
        {([1, 2, 3, 4, 5] as const).map((mood) => (
          <button
            key={mood}
            type="button"
            aria-label={`Filter mood ${mood}`}
            aria-pressed={selectedMood === mood}
            onClick={() => setSelectedMood((current) => (current === mood ? undefined : mood))}
            className={`grid h-7 w-7 place-items-center rounded-full border text-xs transition ${
              selectedMood === mood
                ? 'border-sand/50 bg-sand/10 text-sand'
                : 'border-ink-700 text-bone-500 hover:text-bone-300'
            }`}
          >
            {mood}
          </button>
        ))}
      </div>

      {entries.length === 0 ? (
        <EmptyState
          title="No entries yet"
          text="Start with a sentence. You can always come back and add more."
          action={<Button variant="primary" onClick={onNew}>New entry</Button>}
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          title="Nothing found"
          text={hasFilters ? 'No entries match these filters. Try changing or clearing them.' : 'No entries match your search.'}
        />
      ) : (
        <div className="mt-8 space-y-8">
          {search && (
            <p className="px-4 text-sm text-bone-600">
              {filtered.length} {filtered.length === 1 ? 'result' : 'results'}
            </p>
          )}
          {groups.map((group) => (
            <section key={group.label}>
              <h2 className="mb-2 px-4 text-sm font-medium text-bone-300">{group.label}</h2>
              <div className="space-y-1">
                {group.items.map((entry) => (
                  <EntryRow
                    key={entry.id}
                    entry={entry}
                    searchTerm={search}
                    onOpen={() => onOpen(entry.id)}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  )
}

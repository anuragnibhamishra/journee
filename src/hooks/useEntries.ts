import { useCallback, useEffect, useMemo, useState } from 'react'
import type { Entry } from '../types'
import { uid } from '../lib'

const KEY = 'journee:entries:v2'
const LEGACY_KEY = 'journee:entries:v1'

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function normalizeEntry(value: unknown): Entry | undefined {
  if (!isRecord(value)) return undefined
  const { id, title, body, createdAt, updatedAt } = value
  if (
    typeof id !== 'string' ||
    typeof title !== 'string' ||
    typeof body !== 'string' ||
    typeof createdAt !== 'number' ||
    typeof updatedAt !== 'number'
  ) {
    return undefined
  }
  const mood = value.mood
  const tags = Array.isArray(value.tags) ? value.tags.filter((tag): tag is string => typeof tag === 'string') : []
  return {
    id,
    title,
    body,
    createdAt,
    updatedAt,
    ...(mood === 1 || mood === 2 || mood === 3 || mood === 4 || mood === 5 ? { mood } : {}),
    tags,
    pinned: typeof value.pinned === 'boolean' ? value.pinned : false,
  }
}

function parseEntries(value: unknown): Entry[] {
  return Array.isArray(value)
    ? value.map(normalizeEntry).filter((entry): entry is Entry => entry !== undefined)
    : []
}

function parseBackup(value: unknown): Entry[] {
  if (!isRecord(value) || value.schemaVersion !== 2 || !Array.isArray(value.entries)) {
    throw new Error('This file is not a Journee v2 backup.')
  }
  const parsed = value.entries.map(normalizeEntry)
  if (
    parsed.some((entry) => entry === undefined) ||
    value.entries.some((item) => {
      if (!isRecord(item)) return true
      const mood = item.mood
      return (
        !Array.isArray(item.tags) ||
        item.tags.some((tag) => typeof tag !== 'string') ||
        typeof item.pinned !== 'boolean' ||
        (mood !== undefined && mood !== 1 && mood !== 2 && mood !== 3 && mood !== 4 && mood !== 5)
      )
    })
  ) {
    throw new Error('The backup contains invalid entry data.')
  }
  return parsed.filter((entry): entry is Entry => entry !== undefined)
}

function migrate(): Entry[] {
  try {
    const stored = localStorage.getItem(KEY)
    if (stored) {
      const parsed: unknown = JSON.parse(stored)
      if (isRecord(parsed) && parsed.schemaVersion === 2) return parseEntries(parsed.entries)
      return []
    }

    const legacy = localStorage.getItem(LEGACY_KEY)
    return legacy ? parseEntries(JSON.parse(legacy) as unknown) : []
  } catch (error) {
    console.error('Unable to load or migrate journal entries from localStorage.', error)
    return []
  }
}

export function useEntries() {
  const [raw, setRaw] = useState<Entry[]>(migrate)

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify({ schemaVersion: 2, entries: raw }))
    } catch (error) {
      console.error('Unable to save journal entries to localStorage.', error)
    }
  }, [raw])

  const entries = useMemo(() => [...raw].sort((a, b) => b.createdAt - a.createdAt), [raw])

  const create = useCallback(() => {
    const now = Date.now()
    const entry: Entry = { id: uid(), title: '', body: '', createdAt: now, updatedAt: now, tags: [], pinned: false }
    setRaw((p) => [entry, ...p])
    return entry.id
  }, [])

  const update = useCallback(
    (id: string, patch: Partial<Pick<Entry, 'title' | 'body' | 'mood' | 'tags' | 'pinned'>>) =>
      setRaw((p) => p.map((e) => (e.id === id ? { ...e, ...patch, updatedAt: Date.now() } : e))),
    [],
  )

  const remove = useCallback((id: string) => setRaw((p) => p.filter((e) => e.id !== id)), [])

  const importBackup = useCallback(
    (value: unknown) => {
      const imported = parseBackup(value)
      const incomingById = new Map<string, Entry>()
      for (const entry of imported) {
        const previous = incomingById.get(entry.id)
        if (!previous || entry.updatedAt > previous.updatedAt) incomingById.set(entry.id, entry)
      }

      const existingById = new Map(raw.map((entry) => [entry.id, entry]))
      let added = 0
      let updated = 0
      for (const entry of incomingById.values()) {
        const existing = existingById.get(entry.id)
        if (!existing) {
          existingById.set(entry.id, entry)
          added += 1
        } else if (entry.updatedAt > existing.updatedAt) {
          existingById.set(entry.id, entry)
          updated += 1
        }
      }
      setRaw([...existingById.values()])
      return { added, updated }
    },
    [raw],
  )

  return { entries, create, update, remove, importBackup }
}

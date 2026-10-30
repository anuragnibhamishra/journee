import { useEffect, useRef, useState } from 'react'
import { LuArrowLeft, LuCheck, LuDownload, LuMaximize2, LuMinimize2, LuPin, LuTrash2 } from 'react-icons/lu'
import type { Entry } from '../types'
import { dayLabel, downloadTextFile, entryMarkdown, entryMarkdownFilename, longDate, timeLabel, wordCount } from '../lib'
import { Button, IconButton } from './ui'
import { MoodPicker } from './MoodPicker'
import { TagInput } from './TagInput'
import { MarkdownRead } from './MarkdownRead'
import { ShortcutsHelp } from './ShortcutsHelp'

type EditableEntry = Pick<Entry, 'title' | 'body' | 'mood' | 'tags' | 'pinned'>

interface Props {
  entry: Entry
  focus: boolean
  onToggleFocus: () => void
  onUpdate: (id: string, patch: Partial<EditableEntry>) => void
  onDelete: (id: string) => void
  onBack: () => void
}

const prompts = [
  'What felt meaningful today?',
  'What are you grateful for right now?',
  'What would you like to let go of?',
  'What made you smile today?',
  'What is taking up space in your mind?',
  'What did you learn about yourself recently?',
  'Describe a moment you want to remember.',
  'What would make tomorrow feel a little easier?',
  'What are you looking forward to?',
  'What is something you handled well?',
  'If you could tell your past self one thing, what would it be?',
  'What do you need more of this week?',
  'Write about a small detail you noticed today.',
  'What is one thing you want to celebrate?',
  'How are you feeling beneath the surface?',
]

function promptForEntry(id: string): string {
  let hash = 0
  for (const character of id) hash = (hash * 31 + character.charCodeAt(0)) >>> 0
  return prompts[hash % prompts.length]
}

export function Editor({ entry, focus, onToggleFocus, onUpdate, onDelete, onBack }: Props) {
  const [title, setTitle] = useState(entry.title)
  const [body, setBody] = useState(entry.body)
  const [mood, setMood] = useState<Entry['mood']>(entry.mood)
  const [tags, setTags] = useState(entry.tags)
  const [pinned, setPinned] = useState(entry.pinned)
  const [mode, setMode] = useState<'write' | 'read'>('write')
  const prompt = promptForEntry(entry.id)
  const [saving, setSaving] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const latest = useRef<EditableEntry>({ title, body, mood, tags, pinned })
  const dirty = useRef(false)
  const removed = useRef(false)
  const first = useRef(true)
  const area = useRef<HTMLTextAreaElement>(null)

  latest.current = { title, body, mood, tags, pinned }

  useEffect(() => {
    if (first.current) {
      first.current = false
      return
    }
    dirty.current = true
    setSaving(true)
    const timer = setTimeout(() => {
      onUpdate(entry.id, { title, body, mood, tags, pinned })
      dirty.current = false
      setSaving(false)
    }, 600)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, body, mood, tags, pinned])

  useEffect(
    () => () => {
      if (removed.current) return
      const current = latest.current
      if (!current.title.trim() && !current.body.trim() && !current.mood && current.tags.length === 0) {
        onDelete(entry.id)
      } else if (dirty.current) {
        onUpdate(entry.id, current)
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )

  useEffect(() => {
    const element = area.current
    if (!element) return
    element.style.height = 'auto'
    element.style.height = element.scrollHeight + 'px'
  }, [body])

  useEffect(() => {
    if (!confirming) return
    const timer = setTimeout(() => setConfirming(false), 3500)
    return () => clearTimeout(timer)
  }, [confirming])

  useEffect(() => {
    if (!entry.title && !entry.body) area.current?.focus()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const remove = () => {
    removed.current = true
    onDelete(entry.id)
    onBack()
  }

  const exportMarkdown = () => {
    const updatedEntry = { ...entry, title, body, mood, tags, pinned }
    downloadTextFile(entryMarkdownFilename(updatedEntry), entryMarkdown(updatedEntry), 'text/markdown')
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-6 pb-40">
      <div className="sticky top-0 z-10 -mx-6 flex flex-wrap items-center justify-between gap-y-2 bg-ink-950/95 px-4 py-3 md:px-6">
        <IconButton label="Back" onClick={onBack}>
          <LuArrowLeft size={18} />
        </IconButton>
        <div className="flex flex-wrap items-center justify-end gap-1">
          <span className="mr-1 hidden items-center gap-1.5 text-xs text-bone-600 sm:flex" aria-live="polite">
            {saving ? 'Saving…' : (<><LuCheck size={13} /> Saved</>)}
          </span>
          <Button
            onClick={() => setMode('write')}
            aria-pressed={mode === 'write'}
            className={mode === 'write' ? '!text-sand' : ''}
          >
            Write
          </Button>
          <Button
            onClick={() => setMode('read')}
            aria-pressed={mode === 'read'}
            className={mode === 'read' ? '!text-sand' : ''}
          >
            Read
          </Button>
          <IconButton
            label={pinned ? 'Unpin entry' : 'Pin entry'}
            aria-pressed={pinned}
            onClick={() => setPinned((value) => !value)}
            className={pinned ? '!text-sand' : ''}
          >
            <LuPin size={16} />
          </IconButton>
          <IconButton label="Export entry as Markdown" onClick={exportMarkdown}>
            <LuDownload size={16} />
          </IconButton>
          <ShortcutsHelp />
          <IconButton label={focus ? 'Exit focus mode' : 'Focus mode'} onClick={onToggleFocus}>
            {focus ? <LuMinimize2 size={16} /> : <LuMaximize2 size={16} />}
          </IconButton>
          {confirming ? (
            <>
              <Button onClick={() => setConfirming(false)}>Keep</Button>
              <Button onClick={remove} className="!text-red-300/90 hover:!bg-red-950/40">Delete entry</Button>
            </>
          ) : (
            <IconButton label="Delete entry" onClick={() => setConfirming(true)}>
              <LuTrash2 size={16} />
            </IconButton>
          )}
        </div>
      </div>

      <p className="mt-6 text-sm text-bone-500">
        {dayLabel(entry.createdAt) === 'Today' ? 'Today' : longDate(entry.createdAt)} · {timeLabel(entry.createdAt)}
      </p>
      <input
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        placeholder="Untitled"
        maxLength={120}
        className="mt-3 w-full font-serif text-4xl tracking-tight placeholder:text-ink-600"
      />
      <MoodPicker value={mood} onChange={setMood} />
      <TagInput tags={tags} onChange={setTags} />
      {mode === 'write' ? (
        <textarea
          ref={area}
          value={body}
          onChange={(event) => setBody(event.target.value)}
          placeholder={prompt}
          spellCheck
          className="mt-6 min-h-[50vh] w-full font-serif text-lg leading-[1.5] text-bone-100/90 placeholder:text-ink-600"
        />
      ) : (
        <div className="mt-6 min-h-[50vh]">
          {body.trim() ? (
            <MarkdownRead text={body} />
          ) : (
            <p className="font-serif text-lg text-bone-600">Nothing to read yet.</p>
          )}
        </div>
      )}

      <div className="pointer-events-none fixed bottom-0 left-0 right-0">
        <p className="mx-auto max-w-6xl px-6 pb-5 text-right text-xs tabular-nums text-bone-600">
          {wordCount(body).toLocaleString()} words
          {entry.updatedAt !== entry.createdAt && <> · edited {timeLabel(entry.updatedAt)}</>}
        </p>
      </div>
    </div>
  )
}

import { useEffect, useRef, useState } from 'react'
import { LuSettings2 } from 'react-icons/lu'
import type { Entry } from '../types'
import { downloadTextFile, entryMarkdown, entryMarkdownFilename } from '../lib'
import { Button, IconButton } from './ui'

interface Props {
  entries: Entry[]
  onImport: (value: unknown) => { added: number; updated: number }
}

export function BackupMenu({ entries, onImport }: Props) {
  const [open, setOpen] = useState(false)
  const [showEntries, setShowEntries] = useState(false)
  const [message, setMessage] = useState('')
  const input = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!message) return
    const timer = setTimeout(() => setMessage(''), 4500)
    return () => clearTimeout(timer)
  }, [message])

  const exportAll = () => {
    const content = JSON.stringify({ schemaVersion: 2, entries }, null, 2)
    downloadTextFile(`journee-backup-${new Date().toISOString().slice(0, 10)}.json`, content, 'application/json')
    setMessage('Backup exported.')
  }

  const exportEntry = (entry: Entry) => {
    downloadTextFile(entryMarkdownFilename(entry), entryMarkdown(entry), 'text/markdown')
    setMessage('Entry exported.')
    setShowEntries(false)
  }

  const importFile = async (file: File) => {
    try {
      const backup: unknown = JSON.parse(await file.text())
      const result = onImport(backup)
      setMessage(`Imported ${result.added} new, updated ${result.updated}.`)
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to import this backup.')
    } finally {
      if (input.current) input.current.value = ''
    }
  }

  return (
    <div className="relative">
      <IconButton label="Backup and settings" aria-expanded={open} onClick={() => setOpen((value) => !value)}>
        <LuSettings2 size={16} />
      </IconButton>
      {open && (
        <div className="absolute bottom-full right-0 z-30 mb-2 w-56 rounded-xl border border-ink-700 bg-ink-900 p-3 shadow-xl">
          <p className="mb-2 px-1 text-xs font-medium tracking-normal text-bone-600">Your journal</p>
          <Button onClick={exportAll} className="w-full justify-start">Export all (JSON)</Button>
          <Button
            onClick={() => setShowEntries((value) => !value)}
            disabled={entries.length === 0}
            className="w-full justify-start disabled:cursor-not-allowed disabled:opacity-40"
          >
            Export entry (.md)
          </Button>
          {showEntries && (
            <div className="my-1 max-h-40 overflow-y-auto rounded-lg bg-ink-950/60 p-1">
              {entries.map((entry) => (
                <button
                  key={entry.id}
                  type="button"
                  onClick={() => exportEntry(entry)}
                  className="block w-full truncate rounded-md px-2 py-1.5 text-left text-xs text-bone-500 hover:bg-ink-800 hover:text-bone-100"
                >
                  {entry.title.trim() || 'Untitled'}
                </button>
              ))}
            </div>
          )}
          <Button onClick={() => input.current?.click()} className="w-full justify-start">Import backup (JSON)</Button>
          <input
            ref={input}
            type="file"
            accept="application/json,.json"
            className="sr-only"
            aria-label="Choose a Journee JSON backup"
            onChange={(event) => {
              const file = event.currentTarget.files?.[0]
              if (file) void importFile(file)
            }}
          />
          {message && <p className="mt-2 px-1 text-xs text-bone-500" role="status">{message}</p>}
        </div>
      )}
    </div>
  )
}

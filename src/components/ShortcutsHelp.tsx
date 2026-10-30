import { useState } from 'react'
import { LuKeyboard } from 'react-icons/lu'
import { IconButton } from './ui'

const shortcuts = [
  ['⌘ / Ctrl + N', 'New entry'],
  ['⌘ / Ctrl + K', 'All entries and search'],
  ['Esc', 'Back from editor'],
  ['⌘ / Ctrl + Shift + F', 'Toggle focus mode'],
]

export function ShortcutsHelp() {
  const [open, setOpen] = useState(false)

  return (
    <div className="relative">
      <IconButton label="Shortcuts" onClick={() => setOpen((value) => !value)} aria-expanded={open}>
        <LuKeyboard size={16} />
      </IconButton>
      {open && (
        <div className="absolute right-0 top-full z-20 mt-2 w-64 rounded-xl border border-ink-700 bg-ink-900 p-4 shadow-xl">
          <p className="mb-3 text-xs font-medium uppercase tracking-wide text-bone-500">Keyboard shortcuts</p>
          <ul className="space-y-2.5">
            {shortcuts.map(([keys, label]) => (
              <li key={label} className="flex items-center justify-between gap-3 text-xs">
                <span className="text-bone-400">{label}</span>
                <kbd className="shrink-0 rounded bg-ink-800 px-1.5 py-1 text-bone-300">{keys}</kbd>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { LuFeather, LuPin } from 'react-icons/lu'
import type { Entry } from '../types'
import { excerpt, timeLabel, wordCount } from '../lib'

type BtnProps = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'ghost'; icon?: ReactNode }

export function Button({ variant = 'ghost', icon, children, className = '', ...rest }: BtnProps) {
  const styles =
    variant === 'primary'
      ? 'bg-bone-100 text-ink-950 hover:bg-white active:scale-[0.98]'
      : 'text-bone-300 hover:bg-ink-800 hover:text-bone-100'
  return (
    <button
      className={`inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition duration-150 ${styles} ${className}`}
      {...rest}
    >
      {icon}
      {children}
    </button>
  )
}

export function IconButton({ label, children, className = '', ...rest }: ButtonHTMLAttributes<HTMLButtonElement> & { label: string }) {
  return (
    <button
      aria-label={label}
      title={label}
      className={`grid h-9 w-9 place-items-center rounded-lg text-bone-500 transition duration-150 hover:bg-ink-800 hover:text-bone-100 ${className}`}
      {...rest}
    >
      {children}
    </button>
  )
}

function highlighted(text: string, searchTerm: string): ReactNode {
  const term = searchTerm.trim()
  if (!term) return text
  const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const parts = text.split(new RegExp(`(${escaped})`, 'ig'))
  return parts.map((part, index) =>
    part.toLowerCase() === term.toLowerCase() ? (
      <mark key={index} className="rounded-sm bg-sand/20 px-0.5 text-sand">{part}</mark>
    ) : (
      part
    ),
  )
}

export function EntryRow({ entry, onOpen, searchTerm = '' }: { entry: Entry; onOpen: () => void; searchTerm?: string }) {
  const preview = excerpt(entry.body)
  const title = entry.title.trim() || 'Untitled'
  return (
    <button
      onClick={onOpen}
      className="group block w-full rounded-xl border border-transparent px-4 py-4 transition duration-150 hover:border-ink-700 hover:bg-ink-900"
    >
      <div className="flex items-baseline justify-between gap-4">
        <h3 className="flex min-w-0 items-center gap-2 truncate font-serif text-lg text-bone-100">
          {entry.pinned && <LuPin size={14} className="shrink-0 text-sand" aria-label="Pinned" />}
          <span className="truncate">{highlighted(title, searchTerm)}</span>
        </h3>
        <span className="shrink-0 text-xs tabular-nums text-bone-600">{timeLabel(entry.createdAt)}</span>
      </div>
      {preview && (
        <p className="mt-1 line-clamp-2 font-serif text-[15px] leading-relaxed text-bone-500">
          {highlighted(preview, searchTerm)}
        </p>
      )}
      {entry.tags.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {entry.tags.map((tag) => (
            <span key={tag} className="rounded-full bg-ink-800 px-2 py-0.5 text-[11px] text-bone-500">
              {tag}
            </span>
          ))}
        </div>
      )}
      <p className="mt-2 text-xs text-bone-600">{wordCount(entry.body).toLocaleString()} words</p>
    </button>
  )
}

export function EmptyState({ title, text, action }: { title: string; text: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center px-6 py-20 text-center">
      <div className="grid h-12 w-12 place-items-center rounded-full border border-ink-700 text-bone-500">
        <LuFeather size={20} />
      </div>
      <h3 className="mt-5 font-serif text-xl text-bone-100">{title}</h3>
      <p className="mt-2 max-w-xs text-sm leading-relaxed text-bone-500">{text}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  )
}

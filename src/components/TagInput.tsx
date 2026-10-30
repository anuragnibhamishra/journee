import { useState, type KeyboardEvent } from 'react'
import { LuX } from 'react-icons/lu'
import { IconButton } from './ui'

interface Props {
  tags: string[]
  onChange: (tags: string[]) => void
}

export function TagInput({ tags, onChange }: Props) {
  const [draft, setDraft] = useState('')

  const addTag = () => {
    const tag = draft.trim().replace(/,+$/, '').trim().toLowerCase()
    if (!tag) {
      setDraft('')
      return
    }
    if (tags.length < 8 && !tags.includes(tag)) onChange([...tags, tag])
    setDraft('')
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault()
      addTag()
    } else if (event.key === 'Backspace' && draft.length === 0 && tags.length > 0) {
      onChange(tags.slice(0, -1))
    }
  }

  return (
    <div className="mt-4 flex min-h-8 flex-wrap items-center gap-1.5">
      {tags.map((tag) => (
        <span key={tag} className="inline-flex items-center gap-1 rounded-full bg-ink-800 px-2 py-0.5 text-[11px] text-bone-300">
          {tag}
          <IconButton
            label={`Remove ${tag} tag`}
            onClick={() => onChange(tags.filter((item) => item !== tag))}
            className="!h-5 !w-5 shrink-0 !bg-transparent text-bone-500 hover:!text-bone-200"
          >
            <LuX size={11} />
          </IconButton>
        </span>
      ))}
      {tags.length < 8 && (
        <input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={handleKeyDown}
          aria-label="Add a tag"
          placeholder={tags.length ? 'Add tag…' : 'Add tags…'}
          className="h-8 min-w-[6rem] flex-1 text-sm placeholder:text-ink-600"
        />
      )}
      <span className="text-xs text-bone-600">{tags.length}/8</span>
    </div>
  )
}

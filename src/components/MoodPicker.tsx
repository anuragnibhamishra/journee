import { LuAngry, LuFrown, LuLaugh, LuMeh, LuSmile } from 'react-icons/lu'
import type { Entry } from '../types'

const moods = [
  { value: 1, label: 'Very low', icon: LuAngry },
  { value: 2, label: 'Low', icon: LuFrown },
  { value: 3, label: 'Okay', icon: LuMeh },
  { value: 4, label: 'Good', icon: LuSmile },
  { value: 5, label: 'Great', icon: LuLaugh },
] as const

interface Props {
  value: Entry['mood']
  onChange: (mood: Entry['mood']) => void
}

export function MoodPicker({ value, onChange }: Props) {
  return (
    <div className="mt-4 flex items-center gap-1" role="group" aria-label="How are you feeling?">
      {moods.map(({ value: mood, label, icon: Icon }) => (
        <button
          key={mood}
          type="button"
          aria-label={label}
          aria-pressed={value === mood}
          title={label}
          onClick={() => onChange(value === mood ? undefined : mood)}
          className={`grid h-9 w-9 place-items-center rounded-lg transition ${
            value === mood ? 'bg-sand/10 text-sand' : 'text-bone-600 hover:bg-ink-800 hover:text-bone-200'
          }`}
        >
          <Icon size={18} />
        </button>
      ))}
      <span className="ml-2 text-xs text-bone-600">Mood</span>
    </div>
  )
}

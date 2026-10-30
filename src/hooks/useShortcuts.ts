import { useEffect } from 'react'

interface ShortcutActions {
  onNew: () => void
  onAllEntries: () => void
  onBack: () => void
  onToggleFocus: () => void
  isEditing: boolean
}

export function useShortcuts({ onNew, onAllEntries, onBack, onToggleFocus, isEditing }: ShortcutActions) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const command = event.metaKey || event.ctrlKey
      const key = event.key.toLowerCase()

      if (command && !event.altKey && !event.shiftKey && key === 'n') {
        event.preventDefault()
        onNew()
      } else if (command && !event.altKey && !event.shiftKey && key === 'k') {
        event.preventDefault()
        onAllEntries()
      } else if (command && !event.altKey && event.shiftKey && key === 'f' && isEditing) {
        event.preventDefault()
        onToggleFocus()
      } else if (event.key === 'Escape' && isEditing) {
        event.preventDefault()
        onBack()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isEditing, onAllEntries, onBack, onNew, onToggleFocus])
}

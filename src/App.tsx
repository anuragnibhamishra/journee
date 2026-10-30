import { useCallback, useEffect, useState } from 'react'
import { LuFeather, LuMenu } from 'react-icons/lu'
import { useEntries } from './hooks/useEntries'
import type { View } from './types'
import { Sidebar } from './components/Sidebar'
import { Dashboard } from './components/Dashboard'
import { Entries } from './components/Entries'
import { Editor } from './components/Editor'
import { IconButton } from './components/ui'
import { useShortcuts } from './hooks/useShortcuts'

export default function App() {
  const { entries, create, update, remove, importBackup } = useEntries()
  const [view, setView] = useState<View>({ name: 'home' })
  const [nav, setNav] = useState(false)
  const [focus, setFocus] = useState(false)
  const [focusSearchRequest, setFocusSearchRequest] = useState(0)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  const go = useCallback((v: View) => {
    setView(v)
    setNav(false)
    if (v.name !== 'write') setFocus(false)
  }, [])
  const write = useCallback(() => go({ name: 'write', id: create() }), [create, go])
  const open = useCallback((id: string) => go({ name: 'write', id }), [go])
  const showAll = useCallback(() => {
    go({ name: 'entries' })
    setFocusSearchRequest((request) => request + 1)
  }, [go])
  const back = useCallback(() => go({ name: 'entries' }), [go])
  const toggleFocus = useCallback(() => setFocus((currentFocus) => !currentFocus), [])
  const selectCalendarDate = useCallback((date: string) => {
    setSelectedDate((currentDate) => (currentDate === date ? null : date))
    go({ name: 'entries' })
  }, [go])

  const current = view.name === 'write' ? entries.find((e) => e.id === view.id) : undefined
  useShortcuts({
    onNew: write,
    onAllEntries: showAll,
    onBack: back,
    onToggleFocus: toggleFocus,
    isEditing: view.name === 'write',
  })

  useEffect(() => {
    if (view.name === 'write' && !current) setView({ name: 'entries' })
  }, [view, current])

  return (
    <div className="flex h-full bg-ink-950">
      {!focus && (
        <Sidebar
          view={view}
          entries={entries}
          open={nav}
          selectedDate={selectedDate}
          onClose={() => setNav(false)}
          onNav={go}
          onNew={write}
          onSelectDate={selectCalendarDate}
          onImportBackup={importBackup}
        />
      )}
      <main className="relative min-w-0 flex-1 overflow-y-auto">
        {view.name !== 'write' && (
          <div className="flex items-center gap-2 border-b border-ink-800 px-3 py-2 md:hidden">
            <IconButton label="Open menu" onClick={() => setNav(true)}>
              <LuMenu size={18} />
            </IconButton>
            <LuFeather size={16} className="text-sand" />
            <span className="font-serif text-lg">journee</span>
          </div>
        )}
        {view.name === 'home' && <Dashboard entries={entries} onOpen={open} onNew={write} onAll={() => go({ name: 'entries' })} />}
        {view.name === 'entries' && (
          <Entries
            entries={entries}
            onOpen={open}
            onNew={write}
            focusSearchRequest={focusSearchRequest}
            selectedDate={selectedDate}
            onClearDate={() => setSelectedDate(null)}
          />
        )}
        {current && (
          <Editor
            key={current.id}
            entry={current}
            focus={focus}
            onToggleFocus={toggleFocus}
            onUpdate={update}
            onDelete={remove}
            onBack={back}
          />
        )}
      </main>
    </div>
  )
}

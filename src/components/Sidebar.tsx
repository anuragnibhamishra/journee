import { LuBookOpen, LuCalendarDays, LuFeather, LuPanelLeftClose, LuPanelLeftOpen, LuPenLine } from 'react-icons/lu'
import { useState, type ReactNode } from 'react'
import type { Entry, View } from '../types'
import { Button, IconButton } from './ui'
import { MiniCalendar } from './MiniCalendar'
import { BackupMenu } from './BackupMenu'

interface Props {
  view: View
  entries: Entry[]
  open: boolean
  selectedDate: string | null
  onClose: () => void
  onNav: (v: View) => void
  onNew: () => void
  onSelectDate: (date: string) => void
  onImportBackup: (value: unknown) => { added: number; updated: number }
}

function NavItem({
  active,
  icon,
  children,
  onClick,
  collapsed,
}: {
  active: boolean
  icon: ReactNode
  children: ReactNode
  onClick: () => void
  collapsed: boolean
}) {
  return (
    <button
      onClick={onClick}
      aria-current={active ? 'page' : undefined}
      title={collapsed ? String(children) : undefined}
      className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition duration-150 ${
        active ? 'bg-ink-800 text-bone-100' : 'text-bone-500 hover:bg-ink-850 hover:text-bone-100'
      } ${collapsed ? 'md:justify-center md:px-0' : ''}`}
    >
      {icon}
      <span className={collapsed ? 'md:hidden' : ''}>{children}</span>
    </button>
  )
}

export function Sidebar({
  view,
  entries,
  open,
  selectedDate,
  onClose,
  onNav,
  onNew,
  onSelectDate,
  onImportBackup,
}: Props) {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <>
      <div
        onClick={onClose}
        className={`fixed inset-0 z-30 bg-black/60 transition-opacity duration-200 md:hidden ${open ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
      />
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 shrink-0 flex-col overflow-y-auto border-r border-ink-800 bg-ink-900 px-4 py-6 transition-[width,transform,padding] duration-200 md:static md:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        } ${collapsed ? 'md:w-20 md:px-3' : 'md:w-64'}`}
      >
        <div className={`flex items-center justify-between gap-2 px-2 ${collapsed ? 'md:justify-center md:px-0' : ''}`}>
          <div className={`flex min-w-0 items-center gap-2.5 ${collapsed ? 'md:hidden' : ''}`}>
            <LuFeather size={18} className="shrink-0 text-sand" />
            <span className="font-serif text-2xl tracking-tight">journee</span>
          </div>
          <IconButton
            label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-expanded={!collapsed}
            onClick={() => setCollapsed((value) => !value)}
            className={`hidden shrink-0 md:grid ${collapsed ? 'md:mx-auto' : ''}`}
          >
            {collapsed ? <LuPanelLeftOpen size={16} /> : <LuPanelLeftClose size={16} />}
          </IconButton>
        </div>
        <Button
          variant="primary"
          icon={<LuPenLine size={16} />}
          onClick={onNew}
          aria-label={collapsed ? 'New entry' : undefined}
          title={collapsed ? 'New entry' : undefined}
          className={`mt-8 w-full justify-center ${collapsed ? 'md:px-0' : ''}`}
        >
          <span className={collapsed ? 'md:hidden' : ''}>New entry</span>
        </Button>
        <nav className="mt-6 space-y-1">
          <NavItem active={view.name === 'home'} icon={<LuCalendarDays size={17} />} onClick={() => onNav({ name: 'home' })} collapsed={collapsed}>
            Today
          </NavItem>
          <NavItem active={view.name === 'entries'} icon={<LuBookOpen size={17} />} onClick={() => onNav({ name: 'entries' })} collapsed={collapsed}>
            All entries
          </NavItem>
        </nav>
        {collapsed ? (
          <div className="md:hidden">
            <MiniCalendar entries={entries} selectedDate={selectedDate} onSelectDate={onSelectDate} />
          </div>
        ) : (
          <MiniCalendar entries={entries} selectedDate={selectedDate} onSelectDate={onSelectDate} />
        )}
        <div className={`mt-auto flex items-end justify-between gap-2 pt-8 ${collapsed ? 'md:hidden' : ''}`}>
          <p className={`px-2 text-xs leading-relaxed text-bone-600 ${collapsed ? 'md:hidden' : ''}`}>
            {entries.length} {entries.length === 1 ? 'entry' : 'entries'}
            <br />
            Saved privately on this device
          </p>
          <BackupMenu entries={entries} onImport={onImportBackup} />
        </div>
      </aside>
    </>
  )
}

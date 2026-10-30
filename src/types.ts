export interface Entry {
  id: string
  title: string
  body: string
  createdAt: number
  updatedAt: number
  mood?: 1 | 2 | 3 | 4 | 5
  tags: string[]
  pinned: boolean
}

export type View = { name: 'home' } | { name: 'entries' } | { name: 'write'; id: string }

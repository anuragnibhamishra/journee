import type { ReactNode } from 'react'

function renderInline(text: string): ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*|_[^_]+_)/g).map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={index} className="font-semibold text-bone-100">
          {part.slice(2, -2)}
        </strong>
      )
    }
    if (part.startsWith('_') && part.endsWith('_')) {
      return (
        <em key={index} className="italic">
          {part.slice(1, -1)}
        </em>
      )
    }
    return part
  })
}

export function MarkdownRead({ text }: { text: string }) {
  const lines = text.split(/\r?\n/)
  const blocks: ReactNode[] = []

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index]
    if (!line.trim()) continue

    if (line.startsWith('- ')) {
      const items: ReactNode[] = []
      while (index < lines.length && lines[index].startsWith('- ')) {
        items.push(<li key={index}>{renderInline(lines[index].slice(2))}</li>)
        index += 1
      }
      index -= 1
      blocks.push(
        <ul key={`list-${index}`} className="my-4 list-disc space-y-1 pl-6">
          {items}
        </ul>,
      )
    } else if (line.startsWith('# ')) {
      blocks.push(
        <h1 key={index} className="my-5 font-serif text-3xl tracking-tight text-bone-100">
          {renderInline(line.slice(2))}
        </h1>,
      )
    } else if (line.startsWith('> ')) {
      blocks.push(
        <blockquote key={index} className="my-4 border-l-2 border-sand/60 pl-4 text-bone-500">
          {renderInline(line.slice(2))}
        </blockquote>,
      )
    } else {
      blocks.push(
        <p key={index} className="my-4">
          {renderInline(line)}
        </p>,
      )
    }
  }

  return <div className="font-serif text-lg leading-[1.7] text-bone-100/90">{blocks}</div>
}

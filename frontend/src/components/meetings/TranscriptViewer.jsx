import { useEffect, useRef } from 'react'
import { Copy } from 'lucide-react'
import toast from 'react-hot-toast'
import { formatDuration } from '../../utils/formatters'

export default function TranscriptViewer({ segments = [], currentTime = 0, onSeek }) {
  const activeRef = useRef(null)

  const activeIndex = segments.findIndex((segment) => currentTime >= segment.startTime && currentTime <= segment.endTime)

  useEffect(() => {
    activeRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [activeIndex])

  const copy = async (text) => {
    await navigator.clipboard.writeText(text)
    toast.success('Copied')
  }

  return (
    <div className="max-h-[calc(100vh-260px)] space-y-3 overflow-auto pr-2">
      {segments.map((segment, index) => (
        <article
          className={`rounded-lg border bg-surface p-4 ${index === activeIndex ? 'border-l-2 border-primary bg-primary/10' : 'border-border'}`}
          key={segment.id || index}
          ref={index === activeIndex ? activeRef : null}
        >
          <div className="mb-2 flex items-center justify-between gap-3">
            <button className="font-mono text-xs text-primary" onClick={() => onSeek?.(segment.startTime)} type="button">{formatDuration(segment.startTime)}</button>
            <button className="text-textSecondary hover:text-textPrimary" onClick={() => copy(segment.text)} type="button"><Copy size={16} /></button>
          </div>
          <p className="text-xs font-semibold uppercase tracking-wide text-textSecondary">{segment.speaker || `Speaker ${index + 1}`}</p>
          <p className="mt-2 text-sm leading-6 text-textPrimary">{segment.text}</p>
        </article>
      ))}
    </div>
  )
}

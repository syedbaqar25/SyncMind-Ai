import { Copy } from 'lucide-react'
import toast from 'react-hot-toast'

export default function MeetingSummary({ summary = '' }) {
  const copy = async () => {
    await navigator.clipboard.writeText(summary)
    toast.success('Summary copied')
  }

  return (
    <div className="rounded-lg border border-border bg-surface p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-heading text-xl font-semibold text-textPrimary">Summary</h2>
        <button className="text-textSecondary hover:text-textPrimary" onClick={copy} type="button"><Copy size={17} /></button>
      </div>
      <div className="space-y-4 text-sm leading-7 text-textSecondary">
        {summary ? summary.split(/\n\s*\n/).map((paragraph, index) => <p key={index}>{paragraph}</p>) : <p>No summary yet.</p>}
      </div>
    </div>
  )
}

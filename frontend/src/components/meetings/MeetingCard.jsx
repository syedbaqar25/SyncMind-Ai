import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Calendar, CheckSquare, Clock, MoreHorizontal, RotateCcw, Trash2 } from 'lucide-react'
import { useState } from 'react'
import toast from 'react-hot-toast'
import ConfirmModal from '../shared/ConfirmModal'
import { meetingService } from '../../services/meetingService'
import { formatDuration } from '../../utils/formatters'

const statusClasses = {
  COMPLETED: 'bg-success/15 text-success',
  FAILED: 'bg-error/15 text-error',
  PROCESSING: 'bg-warning/15 text-warning animate-pulse',
  TRANSCRIBING: 'bg-warning/15 text-warning animate-pulse',
  ANALYZING: 'bg-warning/15 text-warning animate-pulse',
  PENDING: 'bg-white/10 text-textSecondary',
}

export default function MeetingCard({ meeting, onDeleted, onUpdated }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)

  const deleteMeeting = async () => {
    await meetingService.remove(meeting.id)
    toast.success('Meeting deleted')
    setConfirmOpen(false)
    onDeleted?.(meeting.id)
  }

  const retryMeeting = async () => {
    const response = await meetingService.process(meeting.id)
    toast.success('Meeting requeued')
    setMenuOpen(false)
    onUpdated?.(response.data)
  }

  return (
    <motion.article
      whileHover={{ y: -2, boxShadow: '0 8px 30px rgba(99,102,241,0.15)' }}
      transition={{ type: 'spring', stiffness: 300 }}
      className="rounded-lg border border-border bg-surface p-5"
    >
      <div className="mb-4 h-20 rounded-lg border border-border bg-[linear-gradient(135deg,rgba(99,102,241,0.22),rgba(168,85,247,0.12))]" />
      <div className="flex items-start justify-between gap-3">
        <Link className="min-w-0 break-words font-heading text-lg font-semibold text-textPrimary hover:text-primary" to={`/meetings/${meeting.id}`}>{meeting.title}</Link>
        <div className="relative flex flex-shrink-0 items-center gap-2">
          <span title={meeting.processingError || meeting.status} className={`rounded-full px-2 py-1 text-xs ${statusClasses[meeting.status] || statusClasses.PENDING}`}>{meeting.status}</span>
          <button className="grid h-9 w-9 place-items-center rounded-lg text-textSecondary hover:bg-background hover:text-textPrimary" onClick={() => setMenuOpen((value) => !value)} type="button">
            <MoreHorizontal size={18} />
          </button>
          {menuOpen ? (
            <div className="absolute right-0 top-10 z-20 w-44 rounded-lg border border-border bg-background p-1 shadow-xl">
              <Link className="block rounded-md px-3 py-2 text-sm text-textSecondary hover:bg-surface hover:text-textPrimary" to={`/meetings/${meeting.id}`}>View Details</Link>
              {meeting.status === 'FAILED' ? (
                <button className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-textSecondary hover:bg-surface hover:text-textPrimary" onClick={retryMeeting} type="button">
                  <RotateCcw size={14} /> Retry
                </button>
              ) : null}
              <button className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-error hover:bg-error/10" onClick={() => setConfirmOpen(true)} type="button">
                <Trash2 size={14} /> Delete
              </button>
            </div>
          ) : null}
        </div>
      </div>
      <p className="mt-2 line-clamp-2 text-sm text-textSecondary">{meeting.description || 'No description yet.'}</p>
      <div className="mt-5 flex flex-wrap gap-3 text-xs text-textSecondary">
        <span className="inline-flex items-center gap-1"><Calendar size={14} /> {new Date(meeting.createdAt).toLocaleDateString()}</span>
        <span className="inline-flex items-center gap-1"><Clock size={14} /> {formatDuration(meeting.duration)}</span>
        <span className="inline-flex items-center gap-1"><CheckSquare size={14} /> {meeting.actionItems?.length || 0}</span>
      </div>
      {meeting.status === 'FAILED' && meeting.processingError ? <p className="mt-3 rounded-lg bg-error/10 p-2 text-xs text-error">{meeting.processingError}</p> : null}
      <ConfirmModal
        open={confirmOpen}
        title="Delete meeting"
        description="This will permanently delete the meeting and all its data."
        confirmLabel="Delete"
        variant="danger"
        onClose={() => setConfirmOpen(false)}
        onConfirm={deleteMeeting}
      />
    </motion.article>
  )
}

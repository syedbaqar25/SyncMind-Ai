import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Calendar, CheckSquare, Clock } from 'lucide-react'
import { formatDuration } from '../../utils/formatters'

const statusClasses = {
  COMPLETED: 'bg-success/15 text-success',
  FAILED: 'bg-error/15 text-error',
  PROCESSING: 'bg-warning/15 text-warning animate-pulse',
  TRANSCRIBING: 'bg-warning/15 text-warning animate-pulse',
  ANALYZING: 'bg-warning/15 text-warning animate-pulse',
  PENDING: 'bg-white/10 text-textSecondary',
}

export default function MeetingCard({ meeting }) {
  return (
    <motion.article
      whileHover={{ y: -2, boxShadow: '0 8px 30px rgba(99,102,241,0.15)' }}
      transition={{ type: 'spring', stiffness: 300 }}
      className="rounded-lg border border-border bg-surface p-5"
    >
      <div className="mb-4 h-20 rounded-lg border border-border bg-[linear-gradient(135deg,rgba(99,102,241,0.22),rgba(168,85,247,0.12))]" />
      <div className="flex items-start justify-between gap-3">
        <Link className="font-heading text-lg font-semibold text-textPrimary hover:text-primary" to={`/meetings/${meeting.id}`}>{meeting.title}</Link>
        <span className={`rounded-full px-2 py-1 text-xs ${statusClasses[meeting.status] || statusClasses.PENDING}`}>{meeting.status}</span>
      </div>
      <p className="mt-2 line-clamp-2 text-sm text-textSecondary">{meeting.description || 'No description yet.'}</p>
      <div className="mt-5 flex flex-wrap gap-3 text-xs text-textSecondary">
        <span className="inline-flex items-center gap-1"><Calendar size={14} /> {new Date(meeting.createdAt).toLocaleDateString()}</span>
        <span className="inline-flex items-center gap-1"><Clock size={14} /> {formatDuration(meeting.duration)}</span>
        <span className="inline-flex items-center gap-1"><CheckSquare size={14} /> {meeting.actionItems?.length || 0}</span>
      </div>
    </motion.article>
  )
}

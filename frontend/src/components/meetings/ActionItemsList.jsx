import { useState } from 'react'
import { motion } from 'framer-motion'

const priorityClasses = {
  LOW: 'bg-white/10 text-textSecondary',
  MEDIUM: 'bg-primary/15 text-primary',
  HIGH: 'bg-warning/15 text-warning',
  URGENT: 'bg-error/15 text-error',
}

export default function ActionItemsList({ items = [], onStatusChange }) {
  const [openId, setOpenId] = useState(null)

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <motion.article layout className="rounded-lg border border-border bg-surface p-4" key={item.id}>
          <button className="w-full text-left" onClick={() => setOpenId(openId === item.id ? null : item.id)} type="button">
            <div className="flex items-start justify-between gap-3">
              <h3 className="font-heading text-base font-semibold text-textPrimary">{item.title}</h3>
              <span className={`rounded-full px-2 py-1 text-xs ${priorityClasses[item.priority] || priorityClasses.MEDIUM}`}>{item.priority}</span>
            </div>
          </button>
          {openId === item.id ? <p className="mt-3 text-sm text-textSecondary">{item.description || 'No description provided.'}</p> : null}
          <div className="mt-4 flex items-center justify-between gap-3">
            <select className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-textPrimary" value={item.status} onChange={(event) => onStatusChange?.(item.id, event.target.value)}>
              <option value="TODO">TODO</option>
              <option value="IN_PROGRESS">IN PROGRESS</option>
              <option value="DONE">DONE</option>
              <option value="CANCELLED">CANCELLED</option>
            </select>
            <div className="flex -space-x-2">
              {(item.assignees || []).slice(0, 3).map((assignee) => (
                <div className="grid h-7 w-7 place-items-center rounded-full border border-background bg-primary/20 text-xs" key={assignee.userId}>
                  {(assignee.user?.name || 'U').slice(0, 1)}
                </div>
              ))}
            </div>
          </div>
        </motion.article>
      ))}
    </div>
  )
}

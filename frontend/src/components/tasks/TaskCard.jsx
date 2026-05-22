import { useDraggable } from '@dnd-kit/core'
import { Calendar, Link as LinkIcon } from 'lucide-react'

const priorityClasses = {
  LOW: 'bg-white/10 text-textSecondary',
  MEDIUM: 'bg-primary/15 text-primary',
  HIGH: 'bg-warning/15 text-warning',
  URGENT: 'bg-error/15 text-error',
}

export default function TaskCard({ task, overlay = false }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({ id: task.id, data: { task } })
  const overdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'DONE'

  return (
    <article
      ref={setNodeRef}
      style={{ transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined }}
      className={`rounded-lg border border-border bg-background p-4 shadow-sm transition ${overlay ? 'rotate-3 scale-105 opacity-80' : ''}`}
      {...listeners}
      {...attributes}
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-heading text-sm font-semibold text-textPrimary">{task.title}</h3>
        <span className={`rounded-full px-2 py-1 text-[11px] ${priorityClasses[task.priority] || priorityClasses.MEDIUM}`}>{task.priority}</span>
      </div>
      <div className="mt-4 flex flex-wrap gap-2 text-xs text-textSecondary">
        {task.meeting ? <span className="inline-flex items-center gap-1 rounded-full bg-surface px-2 py-1"><LinkIcon size={12} /> {task.meeting.title}</span> : null}
        {task.dueDate ? <span className={`inline-flex items-center gap-1 ${overdue ? 'text-error' : ''}`}><Calendar size={12} /> {new Date(task.dueDate).toLocaleDateString()}</span> : null}
      </div>
      <div className="mt-4 flex -space-x-2">
        {(task.assignees || []).slice(0, 3).map((assignee) => (
          <div className="grid h-7 w-7 place-items-center rounded-full border border-background bg-primary/20 text-xs" key={assignee.userId}>
            {(assignee.user?.name || 'U').slice(0, 1)}
          </div>
        ))}
      </div>
    </article>
  )
}

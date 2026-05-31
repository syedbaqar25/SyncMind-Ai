import { DndContext, DragOverlay, useDroppable } from '@dnd-kit/core'
import { useState } from 'react'
import TaskCard from './TaskCard'

const columns = [
  ['TODO', 'TODO'],
  ['IN_PROGRESS', 'IN PROGRESS'],
  ['DONE', 'DONE'],
  ['CANCELLED', 'CANCELLED'],
]

function Column({ id, title, tasks, onDelete, onClearCompleted }) {
  const { setNodeRef, isOver } = useDroppable({ id })
  return (
    <section ref={setNodeRef} className={`min-h-48 rounded-lg border border-border bg-surface p-3 transition sm:min-h-96 ${isOver ? 'border-primary' : ''}`}>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-heading text-sm font-semibold text-textPrimary">{title}</h2>
        <div className="flex items-center gap-2">
          {id === 'DONE' && tasks.length ? <button className="rounded-md bg-background px-2 py-1 text-xs text-error" onClick={onClearCompleted} type="button">Clear Completed</button> : null}
          <span className="rounded-full bg-background px-2 py-1 text-xs text-textSecondary">{tasks.length}</span>
        </div>
      </div>
      <div className="space-y-3">
        {tasks.map((task) => <TaskCard task={task} key={task.id} onDelete={onDelete} />)}
      </div>
    </section>
  )
}

export default function TaskBoard({ tasks = [], onMove, onDelete, onClearCompleted }) {
  const [activeTask, setActiveTask] = useState(null)

  return (
    <DndContext
      onDragStart={(event) => setActiveTask(event.active.data.current?.task)}
      onDragEnd={(event) => {
        if (event.over?.id && activeTask && event.over.id !== activeTask.status) {
          onMove?.(activeTask.id, event.over.id)
        }
        setActiveTask(null)
      }}
      onDragCancel={() => setActiveTask(null)}
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {columns.map(([id, title]) => <Column id={id} title={title} tasks={tasks.filter((task) => task.status === id)} key={id} onDelete={onDelete} onClearCompleted={onClearCompleted} />)}
      </div>
      <DragOverlay>{activeTask ? <TaskCard task={activeTask} overlay /> : null}</DragOverlay>
    </DndContext>
  )
}

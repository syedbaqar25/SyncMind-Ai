export default function TaskFilters({ priority, setPriority, myTasks, setMyTasks }) {
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border bg-surface p-4 md:flex-row md:items-center md:justify-between">
      <div className="flex gap-2">
        <select className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-textPrimary" value={priority} onChange={(event) => setPriority(event.target.value)}>
          <option value="">All priorities</option>
          <option value="LOW">Low</option>
          <option value="MEDIUM">Medium</option>
          <option value="HIGH">High</option>
          <option value="URGENT">Urgent</option>
        </select>
      </div>
      <label className="inline-flex items-center gap-2 text-sm text-textSecondary">
        <input checked={myTasks} onChange={(event) => setMyTasks(event.target.checked)} type="checkbox" />
        My Tasks
      </label>
    </div>
  )
}

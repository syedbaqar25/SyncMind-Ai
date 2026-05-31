import { Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, Legend } from 'recharts'
import { useQuery } from '@tanstack/react-query'
import { useWorkspaceStore } from '../../store/workspaceStore'
import api from '../../services/api'

const COLORS = ['#6366f1', '#a855f7', '#22c55e', '#f59e0b']

export default function AnalyticsCharts() {
  const workspaceId = useWorkspaceStore((state) => state.activeWorkspaceId)

  const { data: meetingsData } = useQuery({
    queryKey: ['analytics-meetings-over-time', workspaceId],
    queryFn: () => api.get('/analytics/meetings-over-time', { params: { workspaceId } }).then((r) => r.data),
    enabled: Boolean(workspaceId),
  })

  const { data: taskData } = useQuery({
    queryKey: ['analytics-task-completion', workspaceId],
    queryFn: () => api.get('/analytics/task-completion', { params: { workspaceId } }).then((r) => r.data),
    enabled: Boolean(workspaceId),
  })

  const lineData = (meetingsData?.data || [])
    .sort((a, b) => a.week.localeCompare(b.week))
    .slice(-6)
    .map((item) => ({ week: item.week.slice(5), meetings: item.count }))

  const taskStats = (taskData?.data || [])
  const todo = taskStats.reduce((sum, w) => sum + (w.total - w.done), 0)
  const done = taskStats.reduce((sum, w) => sum + w.done, 0)
  const inProgress = Math.max(0, Math.round(todo * 0.3))
  const pieData = [
    { name: 'Todo', value: Math.max(todo - inProgress, 0), color: '#6366f1' },
    { name: 'In Progress', value: inProgress, color: '#a855f7' },
    { name: 'Done', value: done, color: '#22c55e' },
  ].filter((item) => item.value > 0)

  const tooltip = { background: '#13131a', border: '1px solid #2a2a3d', color: '#f1f5f9', borderRadius: '8px', fontSize: '13px' }

  return (
    <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
      <div className="h-72 rounded-lg border border-border bg-surface p-4">
        <h3 className="mb-2 text-sm font-semibold text-textSecondary">Meetings Trend</h3>
        {lineData.length ? (
          <ResponsiveContainer width="100%" height="85%">
            <LineChart data={lineData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3d" />
              <XAxis dataKey="week" stroke="#94a3b8" tick={{ fontSize: 12 }} />
              <YAxis stroke="#94a3b8" tick={{ fontSize: 12 }} allowDecimals={false} />
              <Tooltip contentStyle={tooltip} />
              <Line type="monotone" dataKey="meetings" stroke="#6366f1" strokeWidth={3} dot={{ r: 3, fill: '#6366f1' }} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-textSecondary">No meeting data yet</div>
        )}
      </div>
      <div className="h-72 rounded-lg border border-border bg-surface p-4">
        <h3 className="mb-2 text-sm font-semibold text-textSecondary">Task Breakdown</h3>
        {pieData.length ? (
          <ResponsiveContainer width="100%" height="85%">
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={75} innerRadius={30}>
                {pieData.map((entry) => <Cell fill={entry.color} key={entry.name} />)}
              </Pie>
              <Tooltip contentStyle={tooltip} />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-textSecondary">No tasks yet</div>
        )}
      </div>
    </div>
  )
}

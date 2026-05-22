import { Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

const lineData = [
  { week: 'W1', meetings: 2 },
  { week: 'W2', meetings: 4 },
  { week: 'W3', meetings: 3 },
  { week: 'W4', meetings: 7 },
]

const pieData = [
  { name: 'Todo', value: 8, color: '#6366f1' },
  { name: 'In Progress', value: 4, color: '#a855f7' },
  { name: 'Done', value: 12, color: '#22c55e' },
]

export default function AnalyticsCharts() {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="h-72 rounded-lg border border-border bg-surface p-4">
        <ResponsiveContainer>
          <LineChart data={lineData}>
            <XAxis dataKey="week" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" />
            <Tooltip contentStyle={{ background: '#13131a', border: '1px solid #2a2a3d' }} />
            <Line type="monotone" dataKey="meetings" stroke="#6366f1" strokeWidth={3} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="h-72 rounded-lg border border-border bg-surface p-4">
        <ResponsiveContainer>
          <PieChart>
            <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={90}>
              {pieData.map((entry) => <Cell fill={entry.color} key={entry.name} />)}
            </Pie>
            <Tooltip contentStyle={{ background: '#13131a', border: '1px solid #2a2a3d' }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

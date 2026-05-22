import { motion } from 'framer-motion'
import { Area, AreaChart, Bar, BarChart, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { useState } from 'react'
import DashboardLayout from '../components/layout/DashboardLayout'

const data = [
  { name: 'W1', value: 3, done: 40, hours: 4, positive: 4, neutral: 2, negative: 1 },
  { name: 'W2', value: 5, done: 55, hours: 7, positive: 6, neutral: 3, negative: 1 },
  { name: 'W3', value: 4, done: 66, hours: 5, positive: 5, neutral: 4, negative: 0 },
  { name: 'W4', value: 8, done: 78, hours: 11, positive: 8, neutral: 2, negative: 1 },
]
const pie = [{ name: '0-30', value: 8 }, { name: '30-60', value: 5 }, { name: '60-120', value: 3 }, { name: '120+', value: 1 }]

function ChartCard({ title, children }) {
  return (
    <motion.div className="h-80 rounded-lg border border-border bg-surface p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <h2 className="mb-3 font-heading text-base font-semibold">{title}</h2>
      {children}
    </motion.div>
  )
}

export default function AnalyticsPage() {
  const [range, setRange] = useState('12')
  const tooltip = { background: '#13131a', border: '1px solid #2a2a3d', color: '#f1f5f9' }

  return (
    <DashboardLayout title="Analytics">
      <div className="mb-5">
        <select className="rounded-lg border border-border bg-surface px-3 py-2" value={range} onChange={(event) => setRange(event.target.value)}>
          <option value="4">Last 4 weeks</option>
          <option value="8">Last 8 weeks</option>
          <option value="12">Last 12 weeks</option>
        </select>
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        <ChartCard title="Meetings Over Time"><ResponsiveContainer><LineChart data={data}><XAxis dataKey="name" stroke="#94a3b8" /><YAxis stroke="#94a3b8" /><Tooltip contentStyle={tooltip} /><Line dataKey="value" stroke="#6366f1" strokeWidth={3} /></LineChart></ResponsiveContainer></ChartCard>
        <ChartCard title="Recording Hours/Week"><ResponsiveContainer><BarChart data={data}><XAxis dataKey="name" stroke="#94a3b8" /><YAxis stroke="#94a3b8" /><Tooltip contentStyle={tooltip} /><Bar dataKey="hours" fill="#a855f7" /></BarChart></ResponsiveContainer></ChartCard>
        <ChartCard title="Task Completion Rate"><ResponsiveContainer><AreaChart data={data}><XAxis dataKey="name" stroke="#94a3b8" /><YAxis stroke="#94a3b8" /><Tooltip contentStyle={tooltip} /><Area dataKey="done" stroke="#6366f1" fill="#6366f1" fillOpacity={0.25} /></AreaChart></ResponsiveContainer></ChartCard>
        <ChartCard title="Sentiment Distribution"><ResponsiveContainer><BarChart data={data}><XAxis dataKey="name" stroke="#94a3b8" /><YAxis stroke="#94a3b8" /><Tooltip contentStyle={tooltip} /><Bar dataKey="positive" stackId="a" fill="#22c55e" /><Bar dataKey="neutral" stackId="a" fill="#f59e0b" /><Bar dataKey="negative" stackId="a" fill="#ef4444" /></BarChart></ResponsiveContainer></ChartCard>
        <ChartCard title="Top Assignees"><ResponsiveContainer><BarChart layout="vertical" data={[{ name: 'Maya', value: 8 }, { name: 'Noah', value: 6 }, { name: 'Lena', value: 5 }]}><XAxis type="number" stroke="#94a3b8" /><YAxis dataKey="name" type="category" stroke="#94a3b8" /><Tooltip contentStyle={tooltip} /><Bar dataKey="value" fill="#6366f1" /></BarChart></ResponsiveContainer></ChartCard>
        <ChartCard title="Duration Buckets"><ResponsiveContainer><PieChart><Pie data={pie} dataKey="value" nameKey="name" outerRadius={90}>{pie.map((entry, index) => <Cell fill={['#6366f1', '#a855f7', '#22c55e', '#f59e0b'][index]} key={entry.name} />)}</Pie><Tooltip contentStyle={tooltip} /></PieChart></ResponsiveContainer></ChartCard>
      </div>
    </DashboardLayout>
  )
}

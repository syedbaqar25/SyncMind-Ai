import { motion } from 'framer-motion'
import { Area, AreaChart, Bar, BarChart, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend, CartesianGrid } from 'recharts'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import DashboardLayout from '../components/layout/DashboardLayout'
import { useWorkspaceStore } from '../store/workspaceStore'
import api from '../services/api'

function ChartCard({ title, children }) {
  return (
    <motion.div className="h-80 rounded-lg border border-border bg-surface p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <h2 className="mb-3 font-heading text-sm font-semibold sm:text-base">{title}</h2>
      {children}
    </motion.div>
  )
}

function EmptyChart({ message }) {
  return (
    <div className="flex h-full items-center justify-center text-sm text-textSecondary">
      {message || 'No data yet. Upload meetings to see analytics.'}
    </div>
  )
}

const COLORS = ['#6366f1', '#a855f7', '#22c55e', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899', '#14b8a6']

export default function AnalyticsPage() {
  const workspaceId = useWorkspaceStore((state) => state.activeWorkspaceId)
  const [range, setRange] = useState('12')
  const tooltip = { background: '#13131a', border: '1px solid #2a2a3d', color: '#f1f5f9', borderRadius: '8px', fontSize: '13px' }

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

  const { data: speakersData } = useQuery({
    queryKey: ['analytics-top-speakers', workspaceId],
    queryFn: () => api.get('/analytics/top-speakers', { params: { workspaceId } }).then((r) => r.data),
    enabled: Boolean(workspaceId),
  })

  const { data: sentimentData } = useQuery({
    queryKey: ['analytics-sentiment-trends', workspaceId],
    queryFn: () => api.get('/analytics/sentiment-trends', { params: { workspaceId } }).then((r) => r.data),
    enabled: Boolean(workspaceId),
  })

  const { data: durationData } = useQuery({
    queryKey: ['analytics-duration-distribution', workspaceId],
    queryFn: () => api.get('/analytics/duration-distribution', { params: { workspaceId } }).then((r) => r.data),
    enabled: Boolean(workspaceId),
  })

  // Format data for charts
  const meetingsOverTime = (meetingsData?.data || [])
    .sort((a, b) => a.week.localeCompare(b.week))
    .slice(-Number(range))
    .map((item) => ({ name: item.week.slice(5), value: item.count }))

  const taskCompletion = (taskData?.data || [])
    .sort((a, b) => a.week.localeCompare(b.week))
    .slice(-Number(range))
    .map((item) => ({ name: item.week.slice(5), done: item.completionRate, total: item.total }))

  const topSpeakers = (speakersData?.data || []).slice(0, 5).map((item) => ({
    name: item.speaker,
    value: item.segments
  }))

  const sentimentTrends = (sentimentData?.data || [])
    .sort((a, b) => a.week.localeCompare(b.week))
    .slice(-Number(range))
    .map((item) => ({ name: item.week.slice(5), positive: item.positive, neutral: item.neutral, negative: item.negative }))

  const durationBuckets = (durationData?.data || []).map((item) => ({
    name: item.bucket,
    value: item.count
  }))

  // Calculate recording hours from meetings data
  const recordingHours = meetingsOverTime.map((item) => ({
    name: item.name,
    hours: item.value
  }))

  return (
    <DashboardLayout title="Analytics">
      <div className="mb-5">
        <select className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-textPrimary" value={range} onChange={(event) => setRange(event.target.value)}>
          <option value="4">Last 4 weeks</option>
          <option value="8">Last 8 weeks</option>
          <option value="12">Last 12 weeks</option>
        </select>
      </div>
      <div className="grid gap-4 md:grid-cols-1 xl:grid-cols-2">
        <ChartCard title="Meetings Over Time">
          {meetingsOverTime.length ? (
            <ResponsiveContainer width="100%" height="90%">
              <LineChart data={meetingsOverTime}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3d" />
                <XAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 12 }} />
                <YAxis stroke="#94a3b8" tick={{ fontSize: 12 }} allowDecimals={false} />
                <Tooltip contentStyle={tooltip} />
                <Line dataKey="value" stroke="#6366f1" strokeWidth={3} dot={{ r: 4, fill: '#6366f1' }} name="Meetings" />
              </LineChart>
            </ResponsiveContainer>
          ) : <EmptyChart />}
        </ChartCard>

        <ChartCard title="Recording Hours/Week">
          {recordingHours.length ? (
            <ResponsiveContainer width="100%" height="90%">
              <BarChart data={recordingHours}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3d" />
                <XAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 12 }} />
                <YAxis stroke="#94a3b8" tick={{ fontSize: 12 }} allowDecimals={false} />
                <Tooltip contentStyle={tooltip} />
                <Bar dataKey="hours" fill="#a855f7" radius={[4, 4, 0, 0]} name="Meetings" />
              </BarChart>
            </ResponsiveContainer>
          ) : <EmptyChart />}
        </ChartCard>

        <ChartCard title="Task Completion Rate">
          {taskCompletion.length ? (
            <ResponsiveContainer width="100%" height="90%">
              <AreaChart data={taskCompletion}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3d" />
                <XAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 12 }} />
                <YAxis stroke="#94a3b8" tick={{ fontSize: 12 }} unit="%" />
                <Tooltip contentStyle={tooltip} />
                <Area dataKey="done" stroke="#6366f1" fill="#6366f1" fillOpacity={0.25} name="Completion %" />
              </AreaChart>
            </ResponsiveContainer>
          ) : <EmptyChart />}
        </ChartCard>

        <ChartCard title="Sentiment Distribution">
          {sentimentTrends.length ? (
            <ResponsiveContainer width="100%" height="90%">
              <BarChart data={sentimentTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3d" />
                <XAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 12 }} />
                <YAxis stroke="#94a3b8" tick={{ fontSize: 12 }} allowDecimals={false} />
                <Tooltip contentStyle={tooltip} />
                <Bar dataKey="positive" stackId="a" fill="#22c55e" name="Positive" radius={[0, 0, 0, 0]} />
                <Bar dataKey="neutral" stackId="a" fill="#f59e0b" name="Neutral" />
                <Bar dataKey="negative" stackId="a" fill="#ef4444" name="Negative" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <EmptyChart />}
        </ChartCard>

        <ChartCard title="Top Speakers">
          {topSpeakers.length ? (
            <ResponsiveContainer width="100%" height="90%">
              <BarChart layout="vertical" data={topSpeakers}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3d" />
                <XAxis type="number" stroke="#94a3b8" tick={{ fontSize: 12 }} allowDecimals={false} />
                <YAxis dataKey="name" type="category" stroke="#94a3b8" tick={{ fontSize: 12 }} width={80} />
                <Tooltip contentStyle={tooltip} />
                <Bar dataKey="value" fill="#6366f1" radius={[0, 4, 4, 0]} name="Segments">
                  {topSpeakers.map((entry, index) => (
                    <Cell fill={COLORS[index % COLORS.length]} key={entry.name} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : <EmptyChart message="No speakers detected yet." />}
        </ChartCard>

        <ChartCard title="Duration Buckets">
          {durationBuckets.some((b) => b.value > 0) ? (
            <ResponsiveContainer width="100%" height="90%">
              <PieChart>
                <Pie data={durationBuckets} dataKey="value" nameKey="name" outerRadius={80} innerRadius={35} paddingAngle={2} label={({ name, value }) => value > 0 ? name : ''}>
                  {durationBuckets.map((entry, index) => (
                    <Cell fill={COLORS[index % COLORS.length]} key={entry.name} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltip} />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : <EmptyChart />}
        </ChartCard>
      </div>
    </DashboardLayout>
  )
}

import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import DashboardLayout from '../components/layout/DashboardLayout'
import TaskBoard from '../components/tasks/TaskBoard'
import TaskFilters from '../components/tasks/TaskFilters'
import { taskService } from '../services/taskService'
import { useWorkspaceStore } from '../store/workspaceStore'

export default function TasksPage() {
  const workspaceId = useWorkspaceStore((state) => state.activeWorkspaceId)
  const [priority, setPriority] = useState('')
  const [myTasks, setMyTasks] = useState(false)
  const queryClient = useQueryClient()
  const params = useMemo(() => ({ workspaceId, priority: priority || undefined }), [priority, workspaceId])
  const tasksQuery = useQuery({
    queryKey: ['tasks', myTasks ? 'mine' : params],
    queryFn: () => (myTasks ? taskService.myTasks() : taskService.list(params)),
    enabled: Boolean(workspaceId) || myTasks,
  })
  const updateTask = useMutation({
    mutationFn: ({ id, status }) => taskService.update(id, { status }),
    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey: ['tasks'] })
      queryClient.setQueriesData({ queryKey: ['tasks'] }, (old) => {
        if (!old?.data) return old
        return { ...old, data: old.data.map((task) => (task.id === id ? { ...task, status } : task)) }
      })
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['tasks'] }),
  })

  return (
    <DashboardLayout title="Tasks">
      <div className="space-y-5">
        <TaskFilters priority={priority} setPriority={setPriority} myTasks={myTasks} setMyTasks={setMyTasks} />
        <TaskBoard tasks={tasksQuery.data?.data || []} onMove={(id, status) => updateTask.mutate({ id, status })} />
      </div>
    </DashboardLayout>
  )
}

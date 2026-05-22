import { useQuery } from '@tanstack/react-query'
import { taskService } from '../services/taskService'

export const useTasks = (params) =>
  useQuery({
    queryKey: ['tasks', params],
    queryFn: () => taskService.list(params),
    enabled: Boolean(params?.workspaceId),
  })

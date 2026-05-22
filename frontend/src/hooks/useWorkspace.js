import { useQuery } from '@tanstack/react-query'
import { workspaceService } from '../services/workspaceService'

export const useWorkspace = () =>
  useQuery({
    queryKey: ['workspaces'],
    queryFn: workspaceService.list,
  })

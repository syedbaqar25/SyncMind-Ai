import { useQuery } from '@tanstack/react-query'
import { meetingService } from '../services/meetingService'

export const useMeetings = (params) =>
  useQuery({
    queryKey: ['meetings', params],
    queryFn: () => meetingService.list(params),
    enabled: Boolean(params?.workspaceId),
  })

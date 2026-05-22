import { useMutation, useQuery } from '@tanstack/react-query'
import { authService } from '../services/authService'
import { useAuthStore } from '../store/authStore'

export const useAuth = () => {
  const store = useAuthStore()

  const meQuery = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: authService.me,
    enabled: Boolean(store.accessToken),
    retry: false,
  })

  const loginMutation = useMutation({
    mutationFn: authService.login,
    onSuccess: (response) => store.setSession(response.data),
  })

  return {
    ...store,
    meQuery,
    loginMutation,
  }
}

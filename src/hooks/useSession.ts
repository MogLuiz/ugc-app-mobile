import { useAuthStore } from '@/store/auth.store'
import { useSessionContext } from '@/providers/SessionProvider'

export function useSession() {
  const { isLoading, signIn, signOut } = useSessionContext()
  const { user, accessToken, isAuthenticated } = useAuthStore()

  return {
    user,
    accessToken,
    isAuthenticated,
    isLoading,
    signIn,
    signOut,
  }
}

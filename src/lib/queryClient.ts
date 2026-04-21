import { focusManager, QueryClient } from '@tanstack/react-query'
import { AppState } from 'react-native'

// React Native doesn't fire browser visibility events — wire AppState instead
// so refetchOnWindowFocus and refetchInterval resume when app comes to foreground
focusManager.setEventListener((handleFocus) => {
  const subscription = AppState.addEventListener('change', (state) => {
    handleFocus(state === 'active')
  })
  return () => subscription.remove()
})

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      retry: 1,
    },
  },
})

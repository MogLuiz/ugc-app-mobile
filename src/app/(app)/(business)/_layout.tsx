import { Redirect, Stack } from 'expo-router'
import { useSession } from '@/hooks/useSession'

export default function BusinessStackLayout() {
  const { isLoading, isAuthenticated, user } = useSession()

  if (isLoading) return null

  if (!isAuthenticated || !user) {
    return <Redirect href="/sign-in" />
  }

  if (user.role !== 'business') {
    return <Redirect href={'/(creator)/' as never} />
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="financeiro" options={{ headerShown: false }} />
    </Stack>
  )
}

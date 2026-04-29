import { Redirect, Stack } from 'expo-router'
import { useSession } from '@/hooks/useSession'

export default function CreatorStackLayout() {
  const { isLoading, isAuthenticated, user } = useSession()

  if (isLoading) return null

  if (!isAuthenticated || !user) {
    return <Redirect href="/sign-in" />
  }

  if (user.role !== 'creator') {
    return <Redirect href={'/(business)/' as never} />
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="oportunidades" options={{ headerShown: false }} />
      <Stack.Screen name="ganhos" options={{ headerShown: false }} />
    </Stack>
  )
}

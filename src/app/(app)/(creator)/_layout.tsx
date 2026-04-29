import { Stack } from 'expo-router'

export default function CreatorStackLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="oportunidades" options={{ headerShown: false }} />
      <Stack.Screen name="ganhos" options={{ headerShown: false }} />
    </Stack>
  )
}

import { Redirect } from 'expo-router'
import { useAuthStore } from '@/store/auth.store'

export default function AppIndex() {
  const role = useAuthStore((s) => s.user?.role)

  // Group paths are not auto-typed until next expo start; cast is intentional
  if (role === 'creator') return <Redirect href={'/(creator)/' as never} />
  if (role === 'business') return <Redirect href={'/(business)/' as never} />
  return <Redirect href="/sign-in" />
}

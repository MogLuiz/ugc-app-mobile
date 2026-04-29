import { Redirect } from 'expo-router'

export default function BusinessIndexRedirect() {
  return <Redirect href={'/(business)/(tabs)' as never} />
}

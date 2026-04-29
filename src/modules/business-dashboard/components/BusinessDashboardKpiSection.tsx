import { StyleSheet, View } from 'react-native'
import { useRouter } from 'expo-router'
import type { Href } from 'expo-router'
import type { BusinessDashboardKpiCardVm } from '../types'
import { BusinessKpiCard } from './BusinessKpiCard'

export function BusinessDashboardKpiSection({ items }: { items: BusinessDashboardKpiCardVm[] }) {
  const router = useRouter()

  return (
    <View style={styles.grid}>
      {items.map((item) => (
        <BusinessKpiCard key={item.id} item={item} onPress={() => router.push(item.href as Href)} />
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
})

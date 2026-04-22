import { Linking, Pressable, StyleSheet, Text, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import type { ContractRequestItem } from '@/modules/contract-requests/types'

type Props = {
  item: ContractRequestItem
}

export function LocationSection({ item }: Props) {
  if (item.mode === 'REMOTE') return null

  const address = item.jobFormattedAddress ?? item.jobAddress
  if (!address) return null

  const mapsUrl =
    item.jobLatitude && item.jobLongitude
      ? `https://maps.google.com/?q=${item.jobLatitude},${item.jobLongitude}`
      : `https://maps.google.com/?q=${encodeURIComponent(address)}`

  function openMaps() {
    void Linking.openURL(mapsUrl)
  }

  return (
    <View style={styles.container}>
      <Ionicons name="location-outline" size={18} color="#895af6" style={styles.icon} />
      <Text style={styles.address} numberOfLines={3}>{address}</Text>
      <Pressable
        onPress={openMaps}
        style={({ pressed }) => [styles.mapsButton, pressed && styles.mapsButtonPressed]}
        accessibilityLabel="Abrir no mapa"
      >
        <Ionicons name="open-outline" size={16} color="#895af6" />
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  icon: {
    flexShrink: 0,
  },
  address: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: '#1f2937',
    lineHeight: 18,
  },
  mapsButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(137,90,246,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  mapsButtonPressed: {
    backgroundColor: 'rgba(137,90,246,0.2)',
  },
})

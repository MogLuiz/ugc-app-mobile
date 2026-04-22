import { StyleSheet, Text, View } from 'react-native'
import { Image } from 'expo-image'
import { Ionicons } from '@expo/vector-icons'
import { getInitials } from '@/lib/formatters'

type Props = {
  companyName: string
  companyLogoUrl?: string | null
  companyRating?: number | null
}

export function CompanyHeader({ companyName, companyLogoUrl, companyRating }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.avatar}>
        {companyLogoUrl ? (
          <Image
            source={{ uri: companyLogoUrl }}
            style={styles.avatarImage}
            contentFit="cover"
          />
        ) : (
          <Text style={styles.initials}>{getInitials(companyName)}</Text>
        )}
      </View>

      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={2}>{companyName}</Text>
        {companyRating != null && companyRating > 0 ? (
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={13} color="#f59e0b" />
            <Text style={styles.ratingText}>{companyRating.toFixed(1)}</Text>
          </View>
        ) : null}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: '#f0ebff',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    flexShrink: 0,
  },
  avatarImage: {
    width: 56,
    height: 56,
  },
  initials: {
    fontSize: 18,
    fontWeight: '800',
    color: '#895af6',
  },
  info: {
    flex: 1,
    gap: 4,
  },
  name: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1f2937',
    lineHeight: 24,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#78350f',
  },
})

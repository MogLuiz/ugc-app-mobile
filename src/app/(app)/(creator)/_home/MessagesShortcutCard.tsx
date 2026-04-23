import { Pressable, StyleSheet, Text, View } from 'react-native'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { colors } from '@/theme/colors'
import { HomeSectionSkeleton } from './HomeSectionSkeleton'

export function MessagesShortcutCard({
  unreadCount,
  isLoading,
}: {
  unreadCount: number
  isLoading: boolean
}) {
  const router = useRouter()

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Mensagens</Text>

      {isLoading ? (
        <HomeSectionSkeleton rows={1} />
      ) : (
        <Pressable
          style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
          onPress={() => router.push('/(creator)/mensagens' as never)}
        >
          <View style={styles.iconWrap}>
            <Ionicons name="chatbubbles" size={20} color={colors.primary} />
          </View>
          <Text style={styles.label}>Caixa de mensagens</Text>
          {unreadCount > 0 ? (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{unreadCount > 99 ? '99+' : String(unreadCount)}</Text>
            </View>
          ) : null}
          <Ionicons name="chevron-forward" size={16} color={colors.border.light} />
        </Pressable>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  section: { gap: 10 },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text.primary.light,
    letterSpacing: -0.2,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface.light,
    borderRadius: 16,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: colors.border.light,
    borderCurve: 'continuous',
  } as object,
  cardPressed: { opacity: 0.85 },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ede9fb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary.light,
  },
  badge: {
    backgroundColor: '#ef4444',
    borderRadius: 100,
    paddingHorizontal: 7,
    paddingVertical: 2,
    minWidth: 22,
    alignItems: 'center',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#fff',
  },
})

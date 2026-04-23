import { Pressable, StyleSheet, Text, View } from 'react-native'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { colors } from '@/theme/colors'
import { getInitials } from '@/lib/formatters'
import type { InvitePreviewVm } from '@/modules/creator-home/types'
import { HomeSectionSkeleton } from './HomeSectionSkeleton'

export function PendingInvitesPreviewSection({
  items,
  isLoading,
  error,
}: {
  items: InvitePreviewVm[]
  isLoading: boolean
  error: string | null
}) {
  const router = useRouter()

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Convites pendentes</Text>
        {!isLoading && !error && items.length > 0 ? (
          <Pressable onPress={() => router.push('/(creator)/propostas' as never)}>
            <Text style={styles.sectionCta}>Ver todos</Text>
          </Pressable>
        ) : null}
      </View>

      {isLoading ? <HomeSectionSkeleton rows={2} /> : null}

      {!isLoading && error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : null}

      {!isLoading && !error && items.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>Nenhum convite no momento</Text>
        </View>
      ) : null}

      {!isLoading && !error && items.length > 0 ? (
        <View style={styles.list}>
          {items.map((item) => (
            <Pressable
              key={item.id}
              style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
              onPress={() => router.push(`/(creator)/propostas/${item.id}` as never)}
            >
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{getInitials(item.companyName)}</Text>
              </View>
              <View style={styles.cardBody}>
                <Text style={styles.companyName} numberOfLines={1}>
                  {item.companyName}
                </Text>
                <Text style={styles.campaignTitle} numberOfLines={1}>
                  {item.campaignTitle}
                </Text>
                <View style={styles.metaRow}>
                  <View style={styles.paymentBadge}>
                    <Text style={styles.paymentText}>{item.paymentDisplay}</Text>
                  </View>
                  <View style={styles.metaChip}>
                    <Ionicons name="calendar-outline" size={10} color={colors.text.secondary.light} />
                    <Text style={styles.metaChipText}>{item.dateDisplay}</Text>
                  </View>
                  {item.distanceDisplay ? (
                    <View style={styles.metaChip}>
                      <Ionicons name="navigate-outline" size={10} color={colors.text.secondary.light} />
                      <Text style={styles.metaChipText}>{item.distanceDisplay}</Text>
                    </View>
                  ) : null}
                </View>
              </View>
              <Ionicons name="chevron-forward" size={16} color={colors.border.light} />
            </Pressable>
          ))}
        </View>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  section: { gap: 10 },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text.primary.light,
    letterSpacing: -0.2,
  },
  sectionCta: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
  },
  errorText: {
    fontSize: 13,
    color: colors.error,
    paddingVertical: 12,
  },
  emptyCard: {
    backgroundColor: colors.surface.light,
    borderRadius: 14,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  emptyText: {
    fontSize: 13,
    color: colors.text.secondary.light,
  },
  list: { gap: 8 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface.light,
    borderRadius: 16,
    padding: 14,
    gap: 12,
    borderWidth: 1,
    borderColor: colors.border.light,
    borderCurve: 'continuous',
  } as object,
  cardPressed: { opacity: 0.85 },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ede9fb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.primary,
  },
  cardBody: {
    flex: 1,
    gap: 3,
  },
  companyName: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text.primary.light,
    letterSpacing: -0.1,
  },
  campaignTitle: {
    fontSize: 12,
    color: colors.text.secondary.light,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 2,
  },
  paymentBadge: {
    backgroundColor: '#ede9fb',
    borderRadius: 100,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  paymentText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.primary,
  },
  metaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#f1f5f9',
    borderRadius: 100,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  metaChipText: {
    fontSize: 10,
    fontWeight: '500',
    color: colors.text.secondary.light,
  },
})

import { Pressable, StyleSheet, Text, View } from 'react-native'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { colors } from '@/theme/colors'
import type { UpcomingPreviewVm } from '@/modules/creator-home/types'
import { HomeSectionSkeleton } from './HomeSectionSkeleton'

function statusColors(status: string): { bg: string; fg: string } {
  if (status === 'Confirmada') return { bg: '#d1fae5', fg: '#065f46' }
  if (status === 'Pendente') return { bg: '#fef3c7', fg: '#92400e' }
  return { bg: '#f1f5f9', fg: '#475569' }
}

export function UpcomingPreviewSection({
  items,
  isLoading,
  error,
}: {
  items: UpcomingPreviewVm[]
  isLoading: boolean
  error: string | null
}) {
  const router = useRouter()

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Próximos trabalhos</Text>
        {!isLoading && !error && items.length > 0 ? (
          <Pressable onPress={() => router.push('/(creator)/propostas' as never)}>
            <Text style={styles.sectionCta}>Ver todos</Text>
          </Pressable>
        ) : null}
      </View>

      {isLoading ? <HomeSectionSkeleton rows={2} /> : null}

      {!isLoading && error ? <Text style={styles.errorText}>{error}</Text> : null}

      {!isLoading && !error && items.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>Nenhuma gravação agendada</Text>
        </View>
      ) : null}

      {!isLoading && !error && items.length > 0 ? (
        <View style={styles.list}>
          {items.map((item) => {
            const sc = statusColors(item.statusBadge)
            return (
              <Pressable
                key={item.id}
                style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
                onPress={() => router.push(item.href as never)}
              >
                <View style={styles.headerRow}>
                  <Text style={styles.campaignName} numberOfLines={1}>
                    {item.campaignName}
                  </Text>
                  <View style={[styles.statusBadge, { backgroundColor: sc.bg }]}>
                    <Text style={[styles.statusText, { color: sc.fg }]}>{item.statusBadge}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={15} color={colors.border.light} />
                </View>

                <Text style={styles.companyName} numberOfLines={1}>
                  {item.companyName}
                </Text>

                {item.dateDisplay || item.locationDisplay ? (
                  <View style={styles.metaRow}>
                    <Ionicons name="calendar-outline" size={11} color={colors.primary} />
                    <Text style={styles.metaText}>{item.dateDisplay}</Text>
                    {item.locationDisplay ? (
                      <>
                        <Text style={styles.metaDot}>·</Text>
                        <Ionicons name="location-outline" size={11} color={colors.primary} />
                        <Text style={styles.metaText} numberOfLines={1}>
                          {item.locationDisplay}
                        </Text>
                      </>
                    ) : null}
                  </View>
                ) : null}
              </Pressable>
            )
          })}
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
    backgroundColor: colors.surface.light,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border.light,
    padding: 14,
    gap: 5,
  },
  cardPressed: { opacity: 0.85 },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  campaignName: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    color: colors.text.primary.light,
    letterSpacing: -0.1,
  },
  statusBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 100,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
  },
  companyName: {
    fontSize: 12,
    color: colors.text.secondary.light,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flexWrap: 'wrap',
    marginTop: 2,
  },
  metaText: {
    fontSize: 11,
    color: colors.text.secondary.light,
    flexShrink: 1,
  },
  metaDot: {
    fontSize: 11,
    color: colors.text.secondary.light,
  },
})

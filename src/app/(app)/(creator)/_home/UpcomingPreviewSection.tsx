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
            const isConfirmRequired = item.primaryAction === 'CONFIRM_OR_DISPUTE'
            return (
              <View key={item.id} style={styles.cardWrapper}>
                <Pressable
                  style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
                  onPress={() => router.push(item.href as never)}
                >
                  <View style={styles.cardLeft}>
                    <Text style={styles.dateText}>{item.dateDisplay}</Text>
                    <Text style={styles.timeText}>{item.timeDisplay}</Text>
                  </View>
                  <View style={styles.cardBody}>
                    <View style={styles.cardTopRow}>
                      <Text style={styles.campaignName} numberOfLines={1}>
                        {item.campaignName}
                      </Text>
                      <View style={[styles.statusBadge, { backgroundColor: sc.bg }]}>
                        <Text style={[styles.statusText, { color: sc.fg }]}>
                          {item.statusBadge}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.companyName} numberOfLines={1}>
                      {item.companyName}
                    </Text>
                    {(item.locationDisplay || item.durationDisplay) ? (
                      <View style={styles.metaRow}>
                        {item.locationDisplay ? (
                          <>
                            <Ionicons name="location-outline" size={11} color={colors.primary} />
                            <Text style={styles.metaText} numberOfLines={1}>
                              {item.locationDisplay}
                            </Text>
                          </>
                        ) : null}
                        {item.locationDisplay && item.durationDisplay ? (
                          <Text style={styles.metaDot}>·</Text>
                        ) : null}
                        {item.durationDisplay ? (
                          <>
                            <Ionicons name="time-outline" size={11} color={colors.primary} />
                            <Text style={styles.metaText}>{item.durationDisplay}</Text>
                          </>
                        ) : null}
                      </View>
                    ) : null}
                  </View>
                  <Ionicons name="chevron-forward" size={16} color={colors.border.light} />
                </Pressable>

                {isConfirmRequired ? (
                  <Pressable
                    style={({ pressed }) => [
                      styles.confirmStrip,
                      pressed && styles.confirmStripPressed,
                    ]}
                    onPress={() => router.push(item.href as never)}
                  >
                    <Text style={styles.confirmText}>Confirmar serviço realizado</Text>
                    <Ionicons name="chevron-forward" size={14} color="#fff" />
                  </Pressable>
                ) : null}
              </View>
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
  cardWrapper: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface.light,
    padding: 14,
    gap: 12,
  },
  cardPressed: { opacity: 0.85 },
  cardLeft: {
    width: 46,
    alignItems: 'center',
    gap: 2,
  },
  dateText: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.primary,
    textAlign: 'center',
  },
  timeText: {
    fontSize: 10,
    color: colors.text.secondary.light,
    textAlign: 'center',
  },
  cardBody: {
    flex: 1,
    gap: 2,
  },
  cardTopRow: {
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
    marginTop: 2,
    flexShrink: 1,
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
  confirmStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f59e0b',
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  confirmStripPressed: {
    opacity: 0.88,
  },
  confirmText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#fff',
  },
})

import { useMemo } from 'react'
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { MobileEmptyState } from '@/components/MobileEmptyState'
import { getInitials } from '@/lib/formatters'
import {
  useAcceptContractRequestMutation,
  useRejectContractRequestMutation,
} from '@/modules/contract-requests/queries'
import type { WorkInvitePreviewVm } from '@/modules/creator-home/types'
import { colors } from '@/theme/colors'
import { HomeSectionSkeleton } from './HomeSectionSkeleton'

function EmptyIllustration() {
  return (
    <View style={styles.iconBubble}>
      <Ionicons name="mail-outline" size={16} color="#6a36d5" />
    </View>
  )
}

function InviteCard({ item }: { item: WorkInvitePreviewVm }) {
  const router = useRouter()
  const acceptMutation = useAcceptContractRequestMutation()
  const rejectMutation = useRejectContractRequestMutation()

  const busyAction = useMemo(() => {
    if (acceptMutation.isPending) return 'accept'
    if (rejectMutation.isPending) return 'reject'
    return null
  }, [acceptMutation.isPending, rejectMutation.isPending])

  function openDetail() {
    router.push(`/(creator)/propostas/${item.id}` as never)
  }

  function handleAccept() {
    acceptMutation.mutate(item.id, {
      onError: (err) =>
        Alert.alert(
          'Erro',
          err instanceof Error ? err.message : 'Não foi possível aceitar o convite.',
        ),
    })
  }

  function handleReject() {
    rejectMutation.mutate(
      { contractRequestId: item.id },
      {
        onError: (err) =>
          Alert.alert(
            'Erro',
            err instanceof Error ? err.message : 'Não foi possível recusar o convite.',
          ),
      },
    )
  }

  return (
    <View style={styles.card}>
      <Pressable
        style={({ pressed }) => [styles.cardMain, pressed && styles.cardPressed]}
        onPress={openDetail}
      >
        <View style={styles.identityRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{getInitials(item.companyName)}</Text>
          </View>

          <View style={styles.cardBody}>
            <Text style={styles.companyName} numberOfLines={1}>
              {item.companyName}
            </Text>
            <Text style={styles.campaignTitle} numberOfLines={2}>
              {item.title}
            </Text>
          </View>

          <Ionicons name="chevron-forward" size={16} color={colors.border.light} />
        </View>

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
      </Pressable>

      <View style={styles.actionsRow}>
        <Pressable
          style={({ pressed }) => [
            styles.primaryButton,
            pressed && busyAction == null && styles.buttonPressed,
            busyAction != null && styles.buttonDisabled,
          ]}
          onPress={handleAccept}
          disabled={busyAction != null}
        >
          <Text style={styles.primaryButtonText}>
            {busyAction === 'accept' ? 'Aceitando…' : 'Aceitar'}
          </Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.secondaryButton,
            pressed && busyAction == null && styles.buttonPressed,
            busyAction != null && styles.buttonDisabled,
          ]}
          onPress={handleReject}
          disabled={busyAction != null}
        >
          <Text style={styles.secondaryButtonText}>
            {busyAction === 'reject' ? 'Recusando…' : 'Recusar'}
          </Text>
        </Pressable>
      </View>
    </View>
  )
}

export function PendingInvitesPreviewSection({
  items,
  isLoading,
  error,
}: {
  items: WorkInvitePreviewVm[]
  isLoading: boolean
  error: string | null
}) {
  const router = useRouter()
  const hasItems = items.length > 0
  const showBlockingError = !hasItems && !isLoading && Boolean(error)
  const showNonBlockingError = hasItems && Boolean(error)

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Convites de trabalho</Text>
        <Pressable onPress={() => router.push('/(creator)/propostas' as never)}>
          <Text style={styles.sectionCta}>Ver todos</Text>
        </Pressable>
      </View>

      {isLoading && !hasItems ? <HomeSectionSkeleton rows={2} /> : null}

      {showBlockingError ? <Text style={styles.errorText}>{error}</Text> : null}

      {showNonBlockingError ? <Text style={styles.inlineErrorText}>{error}</Text> : null}

      {!isLoading && !error && !hasItems ? (
        <View style={styles.emptyCard}>
          <MobileEmptyState
            compact
            icon={<EmptyIllustration />}
            title="Nenhum convite por enquanto"
            description="Os convites aparecerão aqui quando uma marca encontrar seu perfil."
            actions={
              <View style={styles.centeredActions}>
                <Pressable
                  style={({ pressed }) => [styles.outlineButton, pressed && styles.buttonPressed]}
                  onPress={() => router.push('/(creator)/perfil' as never)}
                >
                  <Text style={styles.outlineButtonText}>Completar perfil</Text>
                </Pressable>
              </View>
            }
          />
        </View>
      ) : null}

      {hasItems ? (
        <View style={styles.list}>
          {items.map((item) => (
            <InviteCard key={item.id} item={item} />
          ))}
        </View>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  section: {
    gap: 10,
  },
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
  inlineErrorText: {
    fontSize: 12,
    color: colors.error,
  },
  emptyCard: {
    backgroundColor: colors.surface.light,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border.light,
    paddingHorizontal: 12,
  },
  list: {
    gap: 12,
  },
  card: {
    backgroundColor: colors.surface.light,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border.light,
    overflow: 'hidden',
  },
  cardMain: {
    padding: 14,
    gap: 10,
  },
  cardPressed: {
    opacity: 0.88,
  },
  identityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
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
    lineHeight: 18,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
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
  actionsRow: {
    flexDirection: 'row',
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  primaryButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,
    backgroundColor: colors.primary,
    minHeight: 38,
    paddingHorizontal: 14,
  },
  primaryButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#fff',
  },
  secondaryButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border.light,
    backgroundColor: colors.surface.light,
    minHeight: 38,
    paddingHorizontal: 14,
  },
  secondaryButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text.primary.light,
  },
  buttonPressed: {
    opacity: 0.9,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  iconBubble: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: '#f0ebff',
  },
  centeredActions: {
    alignItems: 'center',
  },
  outlineButton: {
    borderWidth: 1,
    borderColor: 'rgba(106,54,213,0.35)',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  outlineButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6a36d5',
  },
})

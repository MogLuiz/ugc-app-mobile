import { Ionicons } from '@expo/vector-icons'
import { Image } from 'expo-image'
import type { Href } from 'expo-router'
import { useRouter } from 'expo-router'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { MobileEmptyState } from '@/components/MobileEmptyState'
import { getInitials } from '@/lib/formatters'
import { colors } from '@/theme/colors'
import type { BusinessDashboardPendingResponseItem } from '../types'

const CAMPAIGNS_ROUTE = '/(business)/campanhas' as Href
const AVATAR_SIZE = 38

// ─── Empty illustration ───────────────────────────────────────────────────────

function EmptyIllustration({ icon }: { icon: React.ComponentProps<typeof Ionicons>['name'] }) {
  return (
    <View style={styles.iconBubble}>
      <Ionicons name={icon} size={16} color={colors.primary} />
    </View>
  )
}

// ─── Skeleton ────────────────────────────────────────────────────────────────

function PendingResponsesSkeleton() {
  return (
    <View style={styles.listContainer}>
      {([0, 1, 2] as const).map((i) => (
        <View key={i} style={[styles.item, i === 2 && styles.itemLast]}>
          <View style={styles.skeletonAvatar} />
          <View style={styles.itemBody}>
            <View style={[styles.skeletonLine, styles.skeletonLineTitle]} />
            <View style={[styles.skeletonLine, styles.skeletonLineMeta]} />
          </View>
        </View>
      ))}
    </View>
  )
}

// ─── Item ─────────────────────────────────────────────────────────────────────

function PendingResponseItem({
  item,
  isLast,
  onPress,
}: {
  item: BusinessDashboardPendingResponseItem
  isLast: boolean
  onPress: () => void
}) {
  const metaLine = `${item.creatorName} · ${item.expiresLabel ?? item.waitingLabel}`

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.item,
        isLast && styles.itemLast,
        pressed && styles.itemPressed,
      ]}
      accessibilityRole="button"
      accessibilityLabel={`${item.title} — ${item.creatorName}`}
    >
      {item.creatorAvatarUrl ? (
        <Image source={{ uri: item.creatorAvatarUrl }} style={styles.avatar} contentFit="cover" />
      ) : (
        <View style={styles.avatarFallback}>
          <Text style={styles.avatarInitials}>{getInitials(item.creatorName)}</Text>
        </View>
      )}

      <View style={styles.itemBody}>
        <Text style={styles.itemTitle} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={styles.itemMeta} numberOfLines={1}>
          {metaLine}
        </Text>
      </View>

      <Ionicons name="chevron-forward" size={14} color={colors.border.light} />
    </Pressable>
  )
}

// ─── Section ──────────────────────────────────────────────────────────────────

export type BusinessPendingResponsesSectionProps = {
  items: BusinessDashboardPendingResponseItem[]
  totalCount: number
  hasOverflow: boolean
  isLoading: boolean
  errorMessage: string | null
  hasAnyCampaignData: boolean
}

export function BusinessPendingResponsesSection({
  items,
  totalCount,
  hasOverflow,
  isLoading,
  errorMessage,
  hasAnyCampaignData,
}: BusinessPendingResponsesSectionProps) {
  const router = useRouter()

  function goToCampaigns() {
    router.push(CAMPAIGNS_ROUTE)
  }

  const showItems = !isLoading && errorMessage === null && items.length > 0
  const showEmptyNoCampaigns = !isLoading && errorMessage === null && !hasAnyCampaignData
  const showEmptyNoPending =
    !isLoading && errorMessage === null && hasAnyCampaignData && items.length === 0

  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.title}>Aguardando resposta</Text>
          {totalCount > 0 ? (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{totalCount}</Text>
            </View>
          ) : null}
        </View>
        <Pressable onPress={goToCampaigns} hitSlop={8} accessibilityRole="button">
          <Text style={styles.ctaText}>Ver campanhas</Text>
        </Pressable>
      </View>

      {isLoading ? <PendingResponsesSkeleton /> : null}

      {!isLoading && errorMessage !== null ? (
        <Text style={styles.errorText}>{errorMessage}</Text>
      ) : null}

      {showEmptyNoCampaigns ? (
        <View style={styles.emptyCard}>
          <MobileEmptyState
            compact
            icon={<EmptyIllustration icon="send-outline" />}
            title="Nenhuma campanha criada ainda"
            description="Crie uma campanha para enviar convites a creators."
            actions={
              <View style={styles.centeredActions}>
                <Pressable
                  onPress={() => router.push('/(business)/campanhas/criar' as Href)}
                  style={({ pressed }) => [
                    styles.outlineButton,
                    pressed && styles.outlineButtonPressed,
                  ]}
                  accessibilityRole="button"
                >
                  <Text style={styles.outlineButtonText}>Criar campanha</Text>
                </Pressable>
              </View>
            }
          />
        </View>
      ) : null}

      {showEmptyNoPending ? (
        <View style={styles.emptyCard}>
          <MobileEmptyState
            compact
            icon={<EmptyIllustration icon="checkmark-circle-outline" />}
            title="Nenhum convite aguardando resposta"
            description="Todos os convites enviados já foram respondidos."
          />
        </View>
      ) : null}

      {showItems ? (
        <View style={styles.listContainer}>
          {items.map((item, index) => (
            <PendingResponseItem
              key={item.id}
              item={item}
              isLast={!hasOverflow && index === items.length - 1}
              onPress={goToCampaigns}
            />
          ))}
          {hasOverflow ? (
            <Pressable
              onPress={goToCampaigns}
              style={({ pressed }) => [styles.overflowRow, pressed && styles.itemPressed]}
              accessibilityRole="button"
            >
              <Text style={styles.overflowText}>+{totalCount - 3} convites · Ver todos</Text>
              <Ionicons name="arrow-forward" size={13} color={colors.primary} />
            </Pressable>
          ) : null}
        </View>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  section: { gap: 10 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text.primary.light,
    letterSpacing: -0.2,
  },
  badge: {
    backgroundColor: '#ede9fb',
    borderRadius: 999,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.primary,
  },
  ctaText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
  },
  listContainer: {
    backgroundColor: colors.surface.light,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border.light,
    overflow: 'hidden',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  itemLast: { borderBottomWidth: 0 },
  itemPressed: { opacity: 0.82 },
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
  },
  avatarFallback: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    backgroundColor: '#ede9fb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.primary,
  },
  itemBody: { flex: 1, gap: 3 },
  itemTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text.primary.light,
    letterSpacing: -0.1,
  },
  itemMeta: {
    fontSize: 12,
    color: colors.text.secondary.light,
    lineHeight: 17,
  },
  overflowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 12,
  },
  overflowText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
  emptyCard: {
    backgroundColor: colors.surface.light,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border.light,
    paddingHorizontal: 12,
  },
  centeredActions: { alignItems: 'center' },
  outlineButton: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(137,90,246,0.35)',
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  outlineButtonPressed: { opacity: 0.88 },
  outlineButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
  iconBubble: {
    width: 32,
    height: 32,
    borderRadius: 12,
    backgroundColor: '#f0ebff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    fontSize: 13,
    color: colors.error,
    paddingVertical: 8,
  },
  skeletonAvatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    backgroundColor: colors.border.light,
    opacity: 0.6,
  },
  skeletonLine: {
    height: 12,
    borderRadius: 999,
    backgroundColor: colors.border.light,
    opacity: 0.55,
  },
  skeletonLineTitle: { width: '55%' },
  skeletonLineMeta: { width: '38%', marginTop: 5 },
})

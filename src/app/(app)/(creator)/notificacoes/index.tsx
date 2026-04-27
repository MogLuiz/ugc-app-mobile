import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { MobileEmptyState } from '@/components/MobileEmptyState'
import { formatFullDate, formatTimeAgo } from '@/lib/formatters'
import { resolveNotificationDestination } from '@/modules/notifications/navigation'
import {
  useMarkAllNotificationsAsReadMutation,
  useMarkNotificationAsReadMutation,
  useNotificationsQuery,
  useUnreadNotificationsCountQuery,
} from '@/modules/notifications/queries'
import type { NotificationItem } from '@/modules/notifications/types'
import { colors } from '@/theme/colors'
import theme from '@/theme/theme'

function NotificationsSkeleton() {
  return (
    <View style={styles.listContent}>
      {Array.from({ length: 5 }).map((_, index) => (
        <View key={index} style={styles.skeletonCard}>
          <View style={styles.skeletonTopRow}>
            <View style={styles.skeletonDot} />
            <View style={styles.skeletonTime} />
          </View>
          <View style={styles.skeletonTitle} />
          <View style={styles.skeletonBodyWide} />
          <View style={styles.skeletonBodyShort} />
        </View>
      ))}
    </View>
  )
}

function NotificationsHeader({
  unreadCount,
  isMarkingAll,
  onBack,
  onMarkAll,
}: {
  unreadCount: number
  isMarkingAll: boolean
  onBack: () => void
  onMarkAll: () => void
}) {
  return (
    <View style={styles.screenHeader}>
      <View style={styles.screenHeaderTop}>
        <Pressable
          style={styles.backButton}
          onPress={onBack}
          accessibilityRole="button"
          accessibilityLabel="Voltar"
          hitSlop={8}
        >
          <Ionicons name="arrow-back" size={22} color={theme.colors.textStrong} />
        </Pressable>
        <Text style={styles.screenTitle}>Notificações</Text>
        <View style={styles.backButton} />
      </View>

      <View style={styles.screenHeaderBottom}>
        <Text style={styles.screenSubtitle}>
          {unreadCount > 0
            ? `${unreadCount} não lida${unreadCount > 1 ? 's' : ''}`
            : 'Tudo em dia por aqui'}
        </Text>

        {unreadCount > 0 ? (
          <Pressable
            onPress={onMarkAll}
            disabled={isMarkingAll}
            style={({ pressed }) => [
              styles.markAllButton,
              pressed && styles.markAllButtonPressed,
              isMarkingAll && styles.markAllButtonDisabled,
            ]}
          >
            <Text style={styles.markAllButtonText}>
              {isMarkingAll ? 'Marcando...' : 'Marcar todas como lidas'}
            </Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  )
}

function NotificationCard({
  item,
  onPress,
  isPending,
}: {
  item: NotificationItem
  onPress: (item: NotificationItem) => void
  isPending: boolean
}) {
  const isUnread = !item.readAt
  const timestamp = formatTimeAgo(item.createdAt)
  const accessibilityHint = isUnread ? 'Marca a notificação como lida' : 'Notificação já lida'

  return (
    <Pressable
      onPress={() => onPress(item)}
      disabled={isPending}
      style={({ pressed }) => [
        styles.card,
        isUnread ? styles.cardUnread : styles.cardRead,
        pressed && styles.cardPressed,
      ]}
      accessibilityRole="button"
      accessibilityLabel={item.title}
      accessibilityHint={accessibilityHint}
    >
      <View style={styles.cardTopRow}>
        <View style={styles.cardMetaLeft}>
          <View
            style={[styles.statusDot, isUnread ? styles.statusDotUnread : styles.statusDotRead]}
          />
          <Text style={styles.cardType}>{item.sourceType}</Text>
        </View>
        <Text style={styles.cardTimestamp}>{timestamp}</Text>
      </View>

      <Text style={styles.cardTitle}>{item.title}</Text>
      <Text style={styles.cardBody}>{item.body}</Text>

      <View style={styles.cardFooter}>
        <Text style={styles.cardDate}>{formatFullDate(item.createdAt)}</Text>
        <Text style={[styles.cardState, isUnread ? styles.cardStateUnread : styles.cardStateRead]}>
          {isUnread ? 'Não lida' : 'Lida'}
        </Text>
      </View>
    </Pressable>
  )
}

export default function NotificationsScreen() {
  const router = useRouter()
  const notificationsQuery = useNotificationsQuery({ page: 1, limit: 20 })
  const unreadCountQuery = useUnreadNotificationsCountQuery()
  const markAsReadMutation = useMarkNotificationAsReadMutation()
  const markAllMutation = useMarkAllNotificationsAsReadMutation()

  const notifications = notificationsQuery.data?.items ?? []
  const unreadCount = unreadCountQuery.data?.count ?? 0
  const isInitialLoading = notificationsQuery.isLoading && notifications.length === 0
  const hasError = notificationsQuery.isError && notifications.length === 0

  async function handlePressNotification(item: NotificationItem) {
    const destination = resolveNotificationDestination(item)

    if (!item.readAt && !markAsReadMutation.isPending) {
      try {
        await markAsReadMutation.mutateAsync(item.id)
      } catch {
        // Keep navigation best-effort even if marking as read fails.
      }
    }

    if (!destination) {
      return
    }

    router.push(destination.href)
  }

  function handleRetry() {
    void notificationsQuery.refetch()
    void unreadCountQuery.refetch()
  }

  const emptyState = hasError ? (
    <MobileEmptyState
      title="Não foi possível carregar"
      description="Tente novamente para buscar suas notificações."
      actions={
        <Pressable style={styles.retryButton} onPress={handleRetry}>
          <Text style={styles.retryButtonText}>Tentar novamente</Text>
        </Pressable>
      }
      icon={<Ionicons name="cloud-offline-outline" size={28} color={theme.colors.textMuted} />}
    />
  ) : (
    <MobileEmptyState
      title="Nenhuma notificação ainda"
      description="Quando houver novidades importantes, elas aparecerão aqui."
      icon={<Ionicons name="notifications-off-outline" size={28} color={theme.colors.textMuted} />}
    />
  )

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <NotificationsHeader
        unreadCount={unreadCount}
        isMarkingAll={markAllMutation.isPending}
        onBack={() => router.back()}
        onMarkAll={() => markAllMutation.mutate()}
      />

      {isInitialLoading ? (
        <NotificationsSkeleton />
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <NotificationCard
              item={item}
              onPress={handlePressNotification}
              isPending={markAsReadMutation.isPending}
            />
          )}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          ListEmptyComponent={emptyState}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={notificationsQuery.isRefetching || unreadCountQuery.isRefetching}
              onRefresh={handleRetry}
              tintColor={colors.primary}
            />
          }
        />
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.light,
  },
  screenHeader: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
    gap: 12,
  },
  screenHeaderTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  screenHeaderBottom: {
    gap: 10,
  },
  backButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  screenTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: theme.colors.textStrong,
    letterSpacing: -0.6,
  },
  screenSubtitle: {
    fontSize: 14,
    lineHeight: 20,
    color: theme.colors.textSecondary,
  },
  markAllButton: {
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: theme.colors.primarySurface,
  },
  markAllButtonPressed: {
    opacity: 0.85,
  },
  markAllButtonDisabled: {
    opacity: 0.7,
  },
  markAllButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 32,
    flexGrow: 1,
  },
  separator: {
    height: 12,
  },
  card: {
    borderRadius: 22,
    padding: 18,
  },
  cardUnread: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: 'rgba(137,90,246,0.16)',
    shadowColor: '#895af6',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 4,
  },
  cardRead: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.2)',
  },
  cardPressed: {
    opacity: 0.92,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  cardMetaLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexShrink: 1,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  statusDotUnread: {
    backgroundColor: colors.primary,
  },
  statusDotRead: {
    backgroundColor: '#cbd5e1',
  },
  cardType: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.textSecondary,
    textTransform: 'capitalize',
  },
  cardTimestamp: {
    fontSize: 12,
    color: theme.colors.textMuted,
  },
  cardTitle: {
    marginTop: 12,
    fontSize: 17,
    fontWeight: '800',
    color: theme.colors.textStrong,
    letterSpacing: -0.3,
  },
  cardBody: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 21,
    color: theme.colors.textSecondary,
  },
  cardFooter: {
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(148,163,184,0.28)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardDate: {
    fontSize: 12,
    color: theme.colors.textMuted,
  },
  cardState: {
    fontSize: 12,
    fontWeight: '700',
  },
  cardStateUnread: {
    color: colors.primary,
  },
  cardStateRead: {
    color: theme.colors.textTertiary,
  },
  retryButton: {
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 999,
    backgroundColor: colors.primary,
  },
  retryButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
  },
  skeletonCard: {
    backgroundColor: '#ffffff',
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.14)',
  },
  skeletonTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  skeletonDot: {
    width: 68,
    height: 12,
    borderRadius: 999,
    backgroundColor: '#e2e8f0',
  },
  skeletonTime: {
    width: 52,
    height: 12,
    borderRadius: 999,
    backgroundColor: '#e2e8f0',
  },
  skeletonTitle: {
    marginTop: 14,
    width: '72%',
    height: 18,
    borderRadius: 999,
    backgroundColor: '#e2e8f0',
  },
  skeletonBodyWide: {
    marginTop: 12,
    width: '100%',
    height: 12,
    borderRadius: 999,
    backgroundColor: '#f1f5f9',
  },
  skeletonBodyShort: {
    marginTop: 8,
    width: '78%',
    height: 12,
    borderRadius: 999,
    backgroundColor: '#f1f5f9',
  },
})

import { RefreshControl, ScrollView, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useQueries } from '@tanstack/react-query'
import { useRouter } from 'expo-router'
import { creatorDashboardKeys, creatorPayoutKeys, chatKeys } from '@/lib/query-keys'
import {
  fetchCreatorDashboardSummary,
  fetchCreatorPayouts,
  fetchConversations,
} from '@/modules/creator-home/service'
import {
  adaptCreatorKpis,
  adaptHubInvites,
  adaptHubUpcoming,
  deriveUnreadCount,
} from '@/modules/creator-home/adapters'
import { CreatorDashboardHeader } from '@/modules/creator-home/components/CreatorDashboardHeader'
import { useCreatorOffersHubQuery } from '@/modules/contract-requests/queries'
import { useSession } from '@/hooks/useSession'
import { colors } from '@/theme/colors'
import { CreatorKpiSection } from './_home/CreatorKpiSection'
import { UpcomingPreviewSection } from './_home/UpcomingPreviewSection'
import { PendingInvitesPreviewSection } from './_home/PendingInvitesPreviewSection'
import { MessagesShortcutCard } from './_home/MessagesShortcutCard'
import { AvailableOpportunitiesPreviewSection } from './_home/AvailableOpportunitiesPreviewSection'

export default function HomeScreen() {
  const router = useRouter()
  const { user } = useSession()

  const hubQuery = useCreatorOffersHubQuery()
  const hub = hubQuery.data

  const [summaryQuery, payoutsQuery, conversationsQuery] = useQueries({
    queries: [
      {
        queryKey: creatorDashboardKeys.summary(),
        queryFn: fetchCreatorDashboardSummary,
        staleTime: 60_000,
      },
      {
        queryKey: creatorPayoutKeys.list(),
        queryFn: fetchCreatorPayouts,
        staleTime: 60_000,
      },
      {
        queryKey: chatKeys.conversations(),
        queryFn: fetchConversations,
        staleTime: 30_000,
      },
    ],
  })

  const isRefreshing =
    hubQuery.isRefetching ||
    summaryQuery.isRefetching ||
    payoutsQuery.isRefetching ||
    conversationsQuery.isRefetching

  function onRefresh() {
    void hubQuery.refetch()
    void summaryQuery.refetch()
    void payoutsQuery.refetch()
    void conversationsQuery.refetch()
  }

  const now = new Date()

  const hasKpiData = Boolean(hub && payoutsQuery.data)
  const isKpiLoading = !hasKpiData && (hubQuery.isLoading || payoutsQuery.isLoading)
  const kpiError =
    !hasKpiData && (hubQuery.error || payoutsQuery.error)
      ? 'Não foi possível carregar o resumo.'
      : null
  const kpis =
    hub && payoutsQuery.data
      ? adaptCreatorKpis(
          summaryQuery.data?.averageRating ?? null,
          hub.summary.inProgressCount,
          hub.summary.pendingInvitesCount,
          payoutsQuery.data,
          now,
        )
      : []

  const invites = hub ? adaptHubInvites(hub.pending.invites) : []
  const upcoming = hub ? adaptHubUpcoming(hub.inProgress, now) : []
  const unreadCount = deriveUnreadCount(conversationsQuery.data ?? [])

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
      >
        <CreatorDashboardHeader
          userName={user?.name}
          avatarUrl={user?.avatarUrl}
          onPressAvatar={() => router.push('/(creator)/perfil' as never)}
        />

        <CreatorKpiSection items={kpis} isLoading={isKpiLoading} error={kpiError} />

        <AvailableOpportunitiesPreviewSection />

        <PendingInvitesPreviewSection
          items={invites}
          isLoading={hubQuery.isLoading && !hub}
          error={hubQuery.error ? 'Não foi possível carregar os convites de trabalho.' : null}
        />

        <UpcomingPreviewSection
          items={upcoming}
          isLoading={hubQuery.isLoading && !hub}
          error={hubQuery.error ? 'Não foi possível carregar os próximos trabalhos.' : null}
        />

        <MessagesShortcutCard unreadCount={unreadCount} isLoading={conversationsQuery.isLoading} />
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.light,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 32,
    gap: 24,
  },
})

import { RefreshControl, ScrollView, StyleSheet, Text } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useQueries } from '@tanstack/react-query'
import { creatorDashboardKeys, creatorPayoutKeys, chatKeys } from '@/lib/query-keys'
import {
  fetchCreatorDashboardSummary,
  fetchCreatorPayouts,
  fetchCreatorUpcoming,
  fetchConversations,
} from '@/modules/creator-home/service'
import {
  adaptCreatorKpis,
  adaptWorkInvites,
  adaptUpcoming,
  deriveUnreadCount,
} from '@/modules/creator-home/adapters'
import { useMyCreatorPendingContractRequestsQuery } from '@/modules/contract-requests/queries'
import { useSession } from '@/hooks/useSession'
import { colors } from '@/theme/colors'
import { CreatorKpiSection } from './_home/CreatorKpiSection'
import { UpcomingPreviewSection } from './_home/UpcomingPreviewSection'
import { PendingInvitesPreviewSection } from './_home/PendingInvitesPreviewSection'
import { MessagesShortcutCard } from './_home/MessagesShortcutCard'
import { AvailableOpportunitiesPreviewSection } from './_home/AvailableOpportunitiesPreviewSection'

function getFirstName(name?: string | null): string {
  if (!name) return ''
  return name.trim().split(/\s+/)[0] ?? ''
}

export default function HomeScreen() {
  const { user } = useSession()
  const pendingInvitesQuery = useMyCreatorPendingContractRequestsQuery()

  const [summaryQuery, payoutsQuery, upcomingQuery, conversationsQuery] = useQueries({
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
        queryKey: creatorDashboardKeys.upcoming(),
        queryFn: fetchCreatorUpcoming,
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
    summaryQuery.isRefetching ||
    payoutsQuery.isRefetching ||
    pendingInvitesQuery.isRefetching ||
    upcomingQuery.isRefetching ||
    conversationsQuery.isRefetching

  function onRefresh() {
    void summaryQuery.refetch()
    void payoutsQuery.refetch()
    void pendingInvitesQuery.refetch()
    void upcomingQuery.refetch()
    void conversationsQuery.refetch()
  }

  const hasKpiData = Boolean(summaryQuery.data && payoutsQuery.data)
  const isKpiLoading = !hasKpiData && (summaryQuery.isLoading || payoutsQuery.isLoading)
  const kpiError =
    !hasKpiData && (summaryQuery.error || payoutsQuery.error)
      ? 'Não foi possível carregar o resumo.'
      : null
  const kpis =
    summaryQuery.data && payoutsQuery.data
      ? adaptCreatorKpis(summaryQuery.data, payoutsQuery.data)
      : []
  const invites = adaptWorkInvites(pendingInvitesQuery.data ?? [])
  const upcoming = adaptUpcoming(upcomingQuery.data ?? [])
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
        {user?.name ? <Text style={styles.greeting}>Olá, {getFirstName(user.name)}</Text> : null}

        <CreatorKpiSection items={kpis} isLoading={isKpiLoading} error={kpiError} />

        <AvailableOpportunitiesPreviewSection />

        <PendingInvitesPreviewSection
          items={invites}
          isLoading={pendingInvitesQuery.isLoading}
          error={
            pendingInvitesQuery.error ? 'Não foi possível carregar os convites de trabalho.' : null
          }
        />

        <UpcomingPreviewSection
          items={upcoming}
          isLoading={upcomingQuery.isLoading}
          error={upcomingQuery.error ? 'Não foi possível carregar os próximos trabalhos.' : null}
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
  greeting: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.text.primary.light,
    letterSpacing: -0.4,
  },
})

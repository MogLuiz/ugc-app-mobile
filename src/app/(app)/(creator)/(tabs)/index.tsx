import { useState } from 'react'
import { Alert, RefreshControl, ScrollView, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useQueries } from '@tanstack/react-query'
import { useRouter } from 'expo-router'
import { creatorDashboardKeys, creatorPayoutKeys } from '@/lib/query-keys'
import { fetchCreatorDashboardSummary } from '@/modules/creator-home/service'
import { fetchCreatorPayouts } from '@/modules/creator-payouts/service'
import {
  adaptCreatorKpis,
  adaptHubInvites,
  adaptHubUpcoming,
  adaptPendingActions,
} from '@/modules/creator-home/adapters'
import { CreatorDashboardHeader } from '@/modules/creator-home/components/CreatorDashboardHeader'
import { useUnreadNotificationsCountQuery } from '@/modules/notifications/queries'
import { useCreatorOffersHubQuery } from '@/modules/contract-requests/queries'
import { useSession } from '@/hooks/useSession'
import { UserMenuBottomSheet, type UserMenuAction } from '@/components/UserMenuBottomSheet'
import { colors } from '@/theme/colors'
import type { PendingActionVm } from '@/modules/creator-home/types'
import { CreatorKpiSection } from './_home/CreatorKpiSection'
import { UpcomingPreviewSection } from './_home/UpcomingPreviewSection'
import { PendingInvitesPreviewSection } from './_home/PendingInvitesPreviewSection'
import { AvailableOpportunitiesPreviewSection } from './_home/AvailableOpportunitiesPreviewSection'
import { PendingActionsPreviewSection } from './_home/PendingActionsPreviewSection'
import { ReviewSheet } from './_home/ReviewSheet'
import { ConfirmCompletionSheet } from './_home/ConfirmCompletionSheet'

const PENDING_ACTIONS_LIMIT = 3

export default function HomeScreen() {
  const router = useRouter()
  const { user, signOut } = useSession()
  const [menuOpen, setMenuOpen] = useState(false)
  const [reviewTarget, setReviewTarget] = useState<PendingActionVm | null>(null)
  const [confirmTarget, setConfirmTarget] = useState<PendingActionVm | null>(null)
  const unreadNotificationsQuery = useUnreadNotificationsCountQuery()

  const menuActions: UserMenuAction[] = [
    {
      label: 'Meu perfil',
      icon: 'user',
      onPress: () => {
        setMenuOpen(false)
        router.push('/(creator)/perfil' as never)
      },
    },
    {
      label: 'Ganhos',
      icon: 'dollar-sign',
      onPress: () => {
        setMenuOpen(false)
        router.push('/(creator)/ganhos' as never)
      },
    },
    {
      label: 'Configurações',
      icon: 'settings',
      onPress: () => {
        setMenuOpen(false)
        router.push('/(app)/configuracoes' as never)
      },
    },
    {
      label: 'Sair',
      icon: 'log-out',
      danger: true,
      onPress: () => {
        setMenuOpen(false)
        signOut().catch(() => {
          Alert.alert('Erro ao sair', 'Não foi possível encerrar sua sessão. Tente novamente.')
        })
      },
    },
  ]

  const hubQuery = useCreatorOffersHubQuery()
  const hub = hubQuery.data

  const [summaryQuery, payoutsQuery] = useQueries({
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
    ],
  })

  const isRefreshing =
    hubQuery.isRefetching || summaryQuery.isRefetching || payoutsQuery.isRefetching

  function onRefresh() {
    void hubQuery.refetch()
    void summaryQuery.refetch()
    void payoutsQuery.refetch()
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

  const allPendingActions = hub
    ? adaptPendingActions(hub.inProgress, hub.finalized.completed)
    : []
  const pendingActions = allPendingActions.slice(0, PENDING_ACTIONS_LIMIT)
  const hasPendingActionsOverflow = allPendingActions.length > PENDING_ACTIONS_LIMIT

  function handleReportProblem(itemId: string) {
    setConfirmTarget(null)
    router.push(`/(creator)/propostas/${itemId}` as never)
  }

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
          unreadNotificationsCount={unreadNotificationsQuery.data?.count ?? 0}
          onPressNotifications={() => router.push('/(app)/notificacoes' as never)}
          onPressAvatar={() => setMenuOpen(true)}
        />

        <CreatorKpiSection items={kpis} isLoading={isKpiLoading} error={kpiError} />

        <PendingInvitesPreviewSection
          items={invites}
          isLoading={hubQuery.isLoading && !hub}
          error={hubQuery.error ? 'Não foi possível carregar os convites de trabalho.' : null}
        />

        <PendingActionsPreviewSection
          items={pendingActions}
          hasOverflow={hasPendingActionsOverflow}
          onConfirm={(item) => setConfirmTarget(item)}
          onReview={(item) => setReviewTarget(item)}
        />

        <UpcomingPreviewSection
          items={upcoming}
          isLoading={hubQuery.isLoading && !hub}
          error={hubQuery.error ? 'Não foi possível carregar os próximos trabalhos.' : null}
        />

        <AvailableOpportunitiesPreviewSection />
      </ScrollView>

      <UserMenuBottomSheet
        visible={menuOpen}
        onClose={() => setMenuOpen(false)}
        userName={user?.name}
        avatarUrl={user?.avatarUrl}
        userRole={user?.role}
        actions={menuActions}
      />

      <ReviewSheet
        item={reviewTarget}
        visible={reviewTarget !== null}
        onClose={() => setReviewTarget(null)}
        onSuccess={() => setReviewTarget(null)}
      />

      <ConfirmCompletionSheet
        item={confirmTarget}
        visible={confirmTarget !== null}
        onClose={() => setConfirmTarget(null)}
        onSuccess={() => setConfirmTarget(null)}
        onReportProblem={handleReportProblem}
      />
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

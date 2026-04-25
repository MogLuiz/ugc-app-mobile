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
} from '@/modules/creator-home/adapters'
import { CreatorDashboardHeader } from '@/modules/creator-home/components/CreatorDashboardHeader'
import { useCreatorOffersHubQuery } from '@/modules/contract-requests/queries'
import { useSession } from '@/hooks/useSession'
import { UserMenuBottomSheet, type UserMenuAction } from '@/components/UserMenuBottomSheet'
import { colors } from '@/theme/colors'
import { CreatorKpiSection } from './_home/CreatorKpiSection'
import { UpcomingPreviewSection } from './_home/UpcomingPreviewSection'
import { PendingInvitesPreviewSection } from './_home/PendingInvitesPreviewSection'

import { AvailableOpportunitiesPreviewSection } from './_home/AvailableOpportunitiesPreviewSection'
import { PendingReviewsPreviewSection } from './_home/PendingReviewsPreviewSection'

export default function HomeScreen() {
  const router = useRouter()
  const { user, signOut } = useSession()
  const [menuOpen, setMenuOpen] = useState(false)

  const menuActions: UserMenuAction[] = [
    {
      label: 'Meu perfil',
      icon: 'user',
      onPress: () => {
        setMenuOpen(false)
        router.push('/(app)/(creator)/perfil')
      },
    },
    {
      label: 'Ganhos',
      icon: 'dollar-sign',
      onPress: () => {
        setMenuOpen(false)
        router.push('/(app)/(creator)/ganhos' as never)
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

  const allPendingReviews = hub
    ? hub.finalized.completed.filter((c) => c.myReviewPending === true)
    : []
  const pendingReviews = allPendingReviews.slice(0, 2)
  const hasPendingReviewsOverflow = allPendingReviews.length > 2

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
          onPressAvatar={() => setMenuOpen(true)}
        />

        <CreatorKpiSection items={kpis} isLoading={isKpiLoading} error={kpiError} />

        <AvailableOpportunitiesPreviewSection />

        <PendingInvitesPreviewSection
          items={invites}
          isLoading={hubQuery.isLoading && !hub}
          error={hubQuery.error ? 'Não foi possível carregar os convites de trabalho.' : null}
        />

        <PendingReviewsPreviewSection
          items={pendingReviews}
          hasOverflow={hasPendingReviewsOverflow}
        />

        <UpcomingPreviewSection
          items={upcoming}
          isLoading={hubQuery.isLoading && !hub}
          error={hubQuery.error ? 'Não foi possível carregar os próximos trabalhos.' : null}
        />

      </ScrollView>

      <UserMenuBottomSheet
        visible={menuOpen}
        onClose={() => setMenuOpen(false)}
        userName={user?.name}
        avatarUrl={user?.avatarUrl}
        userRole={user?.role}
        actions={menuActions}
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

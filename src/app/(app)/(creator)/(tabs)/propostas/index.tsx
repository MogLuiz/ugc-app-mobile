import { useCallback } from 'react'
import { FlatList, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Pressable } from 'react-native'
import { useRouter } from 'expo-router'
import { useState } from 'react'
import { useCreatorOffersHubQuery } from '@/modules/contract-requests/queries'
import type { CreatorHubItem } from '@/modules/contract-requests/creator-hub.types'
import { colors } from '@/theme/colors'
import { ProposalSkeleton } from '@/components/proposals/ProposalSkeleton'
import { AppScreenHeader } from '@/components/AppScreenHeader'
import { CreatorHubCard } from './_components/CreatorHubCard'
import { PendingTabContent } from './_components/PendingTabContent'

// TODO: replace FlatList with FlashList (@shopify/flash-list) when KAN-50 is done

type Tab = 'PENDING' | 'ACCEPTED' | 'FINALIZED'

const TABS: { id: Tab; label: string }[] = [
  { id: 'PENDING', label: 'Pendentes' },
  { id: 'ACCEPTED', label: 'Em andamento' },
  { id: 'FINALIZED', label: 'Finalizadas' },
]

function EmptyTab({ title, description }: { title: string; description: string }) {
  return (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyDescription}>{description}</Text>
    </View>
  )
}

export default function PropostasScreen() {
  const [activeTab, setActiveTab] = useState<Tab>('PENDING')
  const router = useRouter()

  const hubQuery = useCreatorOffersHubQuery()
  const hub = hubQuery.data

  function handleAccept(_id: string) {
    // mutation is handled inside CreatorHubCard — hub invalidation fires automatically
  }

  function handleReject(id: string) {
    router.push(`/(creator)/propostas/${id}` as never)
  }

  const tabCounts: Record<Tab, number | null> = {
    PENDING: hub
      ? hub.summary.pendingInvitesCount + hub.summary.pendingApplicationsCount
      : null,
    ACCEPTED: hub?.summary.inProgressCount ?? null,
    FINALIZED: hub
      ? hub.finalized.completed.length +
        hub.finalized.rejected.length +
        hub.finalized.cancelled.length +
        hub.finalized.expired.length
      : null,
  }

  const finalizedItems: CreatorHubItem[] = hub
    ? [
        ...hub.finalized.completed,
        ...hub.finalized.rejected,
        ...hub.finalized.cancelled,
        ...hub.finalized.expired,
      ]
    : []

  const isLoading = hubQuery.isLoading && !hub
  const isRefreshing = hubQuery.isRefetching

  const renderInProgressItem = useCallback(
    ({ item }: { item: CreatorHubItem }) => <CreatorHubCard item={item} />,
    [],
  )

  const renderFinalizedItem = useCallback(
    ({ item }: { item: CreatorHubItem }) => <CreatorHubCard item={item} />,
    [],
  )

  function renderContent() {
    if (isLoading) return <ProposalSkeleton />

    if (!hub) return null

    if (activeTab === 'PENDING') {
      return (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={() => void hubQuery.refetch()}
              tintColor={colors.primary}
            />
          }
        >
          <PendingTabContent
            invites={hub.pending.invites}
            applications={hub.pending.applications}
            onAccept={handleAccept}
            onReject={handleReject}
          />
        </ScrollView>
      )
    }

    if (activeTab === 'ACCEPTED') {
      if (hub.inProgress.length === 0) {
        return (
          <EmptyTab
            title="Nenhum trabalho em andamento"
            description="Quando você aceitar uma proposta, ela aparecerá aqui."
          />
        )
      }
      return (
        <FlatList
          data={hub.inProgress}
          keyExtractor={(item) => item.id}
          renderItem={renderInProgressItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={() => void hubQuery.refetch()}
              tintColor={colors.primary}
            />
          }
        />
      )
    }

    // FINALIZED
    if (finalizedItems.length === 0) {
      return (
        <EmptyTab
          title="Nenhuma oferta finalizada"
          description="Propostas concluídas, recusadas ou canceladas aparecerão aqui."
        />
      )
    }
    return (
      <FlatList
        data={finalizedItems}
        keyExtractor={(item) => item.id}
        renderItem={renderFinalizedItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => void hubQuery.refetch()}
            tintColor={colors.primary}
          />
        }
      />
    )
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <AppScreenHeader title="Ofertas" />
      </View>

      <View style={styles.tabBar}>
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id
          const count = tabCounts[tab.id]
          return (
            <Pressable
              key={tab.id}
              style={[styles.tabItem, isActive && styles.tabItemActive]}
              onPress={() => setActiveTab(tab.id)}
            >
              <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>{tab.label}</Text>
              {count !== null ? (
                <Text style={[styles.tabCount, isActive && styles.tabCountActive]}>{count}</Text>
              ) : null}
            </Pressable>
          )
        })}
      </View>

      {renderContent()}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.light,
  },
  header: {
    paddingHorizontal: 16,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#e7e6e9',
    borderRadius: 100,
    padding: 4,
    marginHorizontal: 16,
    marginBottom: 12,
  },
  tabItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 100,
  },
  tabItemActive: {
    backgroundColor: colors.surface.light,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text.secondary.light,
  },
  tabLabelActive: {
    fontWeight: '700',
    color: colors.text.primary.light,
  },
  tabCount: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.text.secondary.light,
  },
  tabCountActive: {
    color: colors.text.primary.light,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 32,
    gap: 12,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingBottom: 80,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text.primary.light,
    textAlign: 'center',
    letterSpacing: -0.2,
  },
  emptyDescription: {
    fontSize: 13,
    color: colors.text.secondary.light,
    textAlign: 'center',
    lineHeight: 20,
  },
})

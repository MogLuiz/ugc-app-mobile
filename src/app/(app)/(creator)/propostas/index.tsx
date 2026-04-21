import {
  useMyCreatorContractRequestsQuery,
  useMyCreatorPendingContractRequestsQuery,
} from '@/modules/contract-requests/queries'
import type { ContractRequestItem } from '@/modules/contract-requests/types'
import { sortByStartsAtDesc } from '@/modules/contract-requests/utils'
import { colors } from '@/theme/colors'
import { useRouter } from 'expo-router'
import { useMemo, useState } from 'react'
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { ProposalCard } from './_components/ProposalCard'
import { ProposalSkeleton } from './_components/ProposalSkeleton'

// TODO: replace FlatList with FlashList (@shopify/flash-list) when KAN-50 is done

type Tab = 'PENDING' | 'ACCEPTED' | 'FINALIZED'

const TABS: { id: Tab; label: string }[] = [
  { id: 'PENDING', label: 'Pendentes' },
  { id: 'ACCEPTED', label: 'Aceitas' },
  { id: 'FINALIZED', label: 'Finalizadas' },
]

const EMPTY_STATE: Record<Tab, { title: string; description: string }> = {
  PENDING: {
    title: 'Nenhuma proposta pendente',
    description: 'Quando uma empresa te convidar para um trabalho, aparecerá aqui.',
  },
  ACCEPTED: {
    title: 'Nenhum trabalho aceito',
    description: 'Quando você aceitar uma proposta, ela aparecerá aqui.',
  },
  FINALIZED: {
    title: 'Nenhuma proposta finalizada',
    description: 'Propostas concluídas, recusadas ou canceladas aparecerão aqui.',
  },
}

export default function PropostasScreen() {
  const [activeTab, setActiveTab] = useState<Tab>('PENDING')
  const router = useRouter()

  // Pendentes: carrega sempre (tab padrão)
  const pendingQuery = useMyCreatorPendingContractRequestsQuery()

  // Aceitas e Finalizadas: sob demanda ao trocar de tab
  const acceptedQuery = useMyCreatorContractRequestsQuery('ACCEPTED', activeTab === 'ACCEPTED')
  const completedQuery = useMyCreatorContractRequestsQuery('COMPLETED', activeTab === 'FINALIZED')
  const rejectedQuery = useMyCreatorContractRequestsQuery('REJECTED', activeTab === 'FINALIZED')
  const cancelledQuery = useMyCreatorContractRequestsQuery('CANCELLED', activeTab === 'FINALIZED')

  // Tab Finalizadas = merge COMPLETED + REJECTED + CANCELLED, ordenados por startsAt desc
  const finalizedItems = useMemo(() => {
    const completed = completedQuery.data ?? []
    const rejected = rejectedQuery.data ?? []
    const cancelled = cancelledQuery.data ?? []
    return [...completed, ...rejected, ...cancelled].sort(sortByStartsAtDesc)
  }, [completedQuery.data, rejectedQuery.data, cancelledQuery.data])

  const activeItems: ContractRequestItem[] = (() => {
    if (activeTab === 'PENDING') return pendingQuery.data ?? []
    if (activeTab === 'ACCEPTED') return acceptedQuery.data ?? []
    return finalizedItems
  })()

  const isLoading = (() => {
    if (activeTab === 'PENDING') return pendingQuery.isLoading
    if (activeTab === 'ACCEPTED') return acceptedQuery.isLoading
    return completedQuery.isLoading || rejectedQuery.isLoading || cancelledQuery.isLoading
  })()

  const tabCounts: Record<Tab, number | null> = {
    PENDING: pendingQuery.data?.length ?? null,
    ACCEPTED: acceptedQuery.data?.length ?? null,
    FINALIZED:
      completedQuery.data != null || rejectedQuery.data != null || cancelledQuery.data != null
        ? finalizedItems.length
        : null,
  }

  function handleCardPress(item: ContractRequestItem) {
    router.push(`/(creator)/propostas/${item.id}` as never)
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.eyebrow}>OFERTAS</Text>
      </View>

      {/* Tab bar */}
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

      {/* Content */}
      {isLoading ? (
        <ProposalSkeleton />
      ) : activeItems.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>{EMPTY_STATE[activeTab].title}</Text>
          <Text style={styles.emptyDescription}>{EMPTY_STATE[activeTab].description}</Text>
        </View>
      ) : (
        <FlatList
          data={activeItems}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ProposalCard item={item} onPress={() => handleCardPress(item)} />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
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
  header: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
  },
  eyebrow: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text.secondary.light,
    letterSpacing: 2,
    marginBottom: 6,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.text.primary.light,
    letterSpacing: -0.5,
    lineHeight: 34,
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
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  } as object,
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
    gap: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text.primary.light,
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: 14,
    color: colors.text.secondary.light,
    textAlign: 'center',
    lineHeight: 20,
  },
})

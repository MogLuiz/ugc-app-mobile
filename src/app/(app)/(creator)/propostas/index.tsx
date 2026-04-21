import { useMemo, useState } from 'react'
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import {
  useMyCreatorContractRequestsQuery,
  useMyCreatorPendingContractRequestsQuery,
} from '@/modules/contract-requests/queries'
import { sortByStartsAtDesc } from '@/modules/contract-requests/utils'
import type { ContractRequestItem } from '@/modules/contract-requests/types'
import { colors } from '@/theme/colors'
import { ProposalCard } from '@/components/proposals/ProposalCard'
import { ProposalSkeleton } from '@/components/proposals/ProposalSkeleton'

// TODO: replace FlatList with FlashList (@shopify/flash-list) when KAN-50 is done

type Tab = 'PENDING' | 'ACCEPTED' | 'FINALIZED'

const TABS: { id: Tab; label: string }[] = [
  { id: 'PENDING', label: 'Pendentes' },
  { id: 'ACCEPTED', label: 'Aceitas' },
  { id: 'FINALIZED', label: 'Finalizadas' },
]

type EmptyConfig = {
  title: string
  description: string
  cta?: { label: string; route: string }
}

const EMPTY_STATE: Record<Tab, EmptyConfig> = {
  PENDING: {
    title: 'Nenhuma oferta por enquanto',
    description: 'Assim que empresas enviarem propostas, elas aparecerão aqui.',
    cta: {
      label: 'Complete seu perfil para receber mais ofertas',
      route: '/(creator)/perfil',
    },
  },
  ACCEPTED: {
    title: 'Nenhum trabalho aceito',
    description: 'Quando uma proposta for aceita, ela aparecerá aqui.',
  },
  FINALIZED: {
    title: 'Nenhuma oferta finalizada',
    description: 'Propostas concluídas, recusadas ou canceladas aparecerão aqui.',
  },
}

function EmptyState({ config, onCtaPress }: { config: EmptyConfig; onCtaPress?: () => void }) {
  return (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconWrap}>
        <Ionicons name="pricetag-outline" size={28} color="#cbd5e1" />
        <View style={styles.emptyBadge}>
          <Text style={styles.emptyBadgeText}>0</Text>
        </View>
      </View>

      <Text style={styles.emptyTitle}>{config.title}</Text>
      <Text style={styles.emptyDescription}>{config.description}</Text>

      {config.cta && onCtaPress ? (
        <Pressable style={styles.emptyCta} onPress={onCtaPress}>
          <Text style={styles.emptyCtaText}>{config.cta.label}</Text>
          <Ionicons name="arrow-forward" size={13} color={colors.text.secondary.light} />
        </Pressable>
      ) : null}
    </View>
  )
}

export default function PropostasScreen() {
  const [activeTab, setActiveTab] = useState<Tab>('PENDING')
  const router = useRouter()

  const pendingQuery = useMyCreatorPendingContractRequestsQuery()
  const acceptedQuery = useMyCreatorContractRequestsQuery('ACCEPTED', activeTab === 'ACCEPTED')
  const completedQuery = useMyCreatorContractRequestsQuery('COMPLETED', activeTab === 'FINALIZED')
  const rejectedQuery = useMyCreatorContractRequestsQuery('REJECTED', activeTab === 'FINALIZED')
  const cancelledQuery = useMyCreatorContractRequestsQuery('CANCELLED', activeTab === 'FINALIZED')

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

  function handleCtaPress(route: string) {
    router.push(route as never)
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>OFERTAS</Text>
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
              <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
                {tab.label}
              </Text>
              {count !== null ? (
                <Text style={[styles.tabCount, isActive && styles.tabCountActive]}>
                  {count}
                </Text>
              ) : null}
            </Pressable>
          )
        })}
      </View>

      {isLoading ? (
        <ProposalSkeleton />
      ) : activeItems.length === 0 ? (
        <EmptyState
          config={EMPTY_STATE[activeTab]}
          onCtaPress={
            EMPTY_STATE[activeTab].cta
              ? () => handleCtaPress(EMPTY_STATE[activeTab].cta!.route)
              : undefined
          }
        />
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

  // Empty state
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingBottom: 80,
    gap: 0,
  },
  emptyIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#f6f5f8',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#ef4444',
    borderWidth: 2,
    borderColor: colors.surface.light,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyBadgeText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#fff',
    lineHeight: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text.primary.light,
    textAlign: 'center',
    letterSpacing: -0.3,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    color: colors.text.secondary.light,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  emptyCta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.surface.light,
    borderWidth: 1,
    borderColor: colors.border.light,
    borderRadius: 100,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  emptyCtaText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text.secondary.light,
  },
})

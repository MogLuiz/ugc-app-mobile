import { useState } from 'react'
import { FlatList, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { MobileEmptyState } from '@/components/MobileEmptyState'
import { formatCurrency } from '@/lib/formatters'
import { useCreatorPayoutsQuery } from '@/modules/creator-payouts/queries'
import type { CreatorPayout } from '@/modules/creator-payouts/types'
import { colors } from '@/theme/colors'
import theme from '@/theme/theme'
import { PayoutDetailSheet } from './_ganhos/PayoutDetailSheet'
import { PayoutListItem } from './_ganhos/PayoutListItem'
import { PayoutSummaryCards } from './_ganhos/PayoutSummaryCards'
import { type GanhosTab, PayoutTabBar } from './_ganhos/PayoutTabBar'
import { PixDataBlock } from './_ganhos/PixDataBlock'

function ListSkeleton() {
  return (
    <View style={styles.skeletonList}>
      {Array.from({ length: 3 }).map((_, i) => (
        <View key={i} style={styles.skeletonItem}>
          <View style={styles.skeletonLeft}>
            <View style={styles.skeletonDate} />
            <View style={styles.skeletonBadge} />
          </View>
          <View style={styles.skeletonAmount} />
        </View>
      ))}
    </View>
  )
}

export default function GanhosScreen() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<GanhosTab>('a-receber')
  const [selectedPayout, setSelectedPayout] = useState<CreatorPayout | null>(null)

  const { data: payouts = [], isLoading, error } = useCreatorPayoutsQuery()

  const aReceber = payouts.filter(
    (p) => p.status === 'pending' || p.status === 'scheduled',
  )
  const recebidos = payouts.filter((p) => p.status === 'paid')

  const aReceberTotal = aReceber.reduce((s, p) => s + p.amountCents, 0)
  const recebidoTotal = recebidos.reduce((s, p) => s + p.amountCents, 0)

  function handlePayoutPress(payout: CreatorPayout) {
    setSelectedPayout(payout)
  }

  const listHeader = (
    <View style={styles.header}>
      <PayoutSummaryCards
        aReceberCents={aReceberTotal}
        recebidoCents={recebidoTotal}
        aReceberCount={aReceber.length}
        recebidoCount={recebidos.length}
        isLoading={isLoading}
      />
      <PayoutTabBar activeTab={activeTab} onTabChange={setActiveTab} />
    </View>
  )

  const activeList = activeTab === 'a-receber' ? aReceber : recebidos

  const emptyTitle =
    activeTab === 'a-receber'
      ? 'Nenhum valor a receber'
      : 'Nenhum repasse recebido ainda'
  const emptyDescription =
    activeTab === 'a-receber'
      ? 'Finalize um serviço para liberar o pagamento.'
      : 'Aqui aparecerão todos os repasses que já foram pagos para você.'

  if (activeTab === 'dados-pix') {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <GanhosHeader onBack={() => router.back()} />
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {listHeader}
          <View style={styles.pixPlaceholder}>
            <PixDataBlock />
          </View>
        </ScrollView>
        <PayoutDetailSheet
          payout={selectedPayout}
          onClose={() => setSelectedPayout(null)}
        />
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <GanhosHeader onBack={() => router.back()} />
      <FlatList
        data={isLoading ? [] : activeList}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <PayoutListItem payout={item} onPress={handlePayoutPress} />
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListHeaderComponent={listHeader}
        ListEmptyComponent={
          isLoading ? (
            <ListSkeleton />
          ) : error ? (
            <MobileEmptyState
              title="Não foi possível carregar"
              description="Verifique sua conexão e tente novamente."
            />
          ) : (
            <MobileEmptyState title={emptyTitle} description={emptyDescription} />
          )
        }
        ListFooterComponent={
          activeTab === 'recebido' && recebidos.length > 0 ? (
            <RecebidoFooter totalCents={recebidoTotal} />
          ) : null
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
      <PayoutDetailSheet
        payout={selectedPayout}
        onClose={() => setSelectedPayout(null)}
      />
    </SafeAreaView>
  )
}

function GanhosHeader({ onBack }: { onBack: () => void }) {
  return (
    <View style={styles.screenHeader}>
      <Pressable
        style={styles.backButton}
        onPress={onBack}
        accessibilityRole="button"
        accessibilityLabel="Voltar"
        hitSlop={8}
      >
        <Ionicons name="arrow-back" size={22} color={theme.colors.textStrong} />
      </Pressable>
      <Text style={styles.screenTitle}>GANHOS</Text>
      <View style={styles.backButton} />
    </View>
  )
}

function RecebidoFooter({ totalCents }: { totalCents: number }) {
  return (
    <View style={styles.footer}>
      <Text style={styles.footerLabel}>Total recebido</Text>
      <Text style={styles.footerValue}>{formatCurrency(totalCents / 100)}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.light,
  },
  screenHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 4,
  },
  backButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  screenTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.textSecondary,
    letterSpacing: 2,
  },
  header: {
    gap: 0,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 0,
  },
  listContent: {
    paddingBottom: 40,
    gap: 0,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  separator: {
    height: 8,
    marginHorizontal: 16,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border.light,
  },
  footerLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  footerValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#15803d',
  },
  pixPlaceholder: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  skeletonList: {
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 8,
  },
  skeletonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface.light,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  skeletonLeft: {
    gap: 8,
    flex: 1,
  },
  skeletonDate: {
    width: '55%',
    height: 13,
    borderRadius: 999,
    backgroundColor: colors.border.light,
  },
  skeletonBadge: {
    width: '35%',
    height: 20,
    borderRadius: 999,
    backgroundColor: colors.border.light,
    opacity: 0.6,
  },
  skeletonAmount: {
    width: 72,
    height: 20,
    borderRadius: 999,
    backgroundColor: colors.border.light,
    opacity: 0.7,
  },
})

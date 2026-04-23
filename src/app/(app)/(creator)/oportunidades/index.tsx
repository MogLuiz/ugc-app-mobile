import { useMemo, useState } from 'react'
import { Modal, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { MobileEmptyState } from '@/components/MobileEmptyState'
import { AppScreenHeader } from '@/components/AppScreenHeader'
import { colors } from '@/theme/colors'
import {
  extractWorkTypes,
  filterOpportunities,
  flattenOpportunityPages,
  isAddressRequiredError,
  selectDisplayableOpenOpportunities,
  sortOpportunities,
} from '@/modules/opportunities/helpers'
import { useInfiniteOpportunitiesQuery } from '@/modules/opportunities/queries'
import { OpportunityCard } from '@/modules/opportunities/components/OpportunityCard'
import type { OpportunityFilters, SortOption } from '@/modules/opportunities/types'

const DEFAULT_FILTERS: OpportunityFilters = {
  workType: 'all',
  distance: 'all',
}

const SORT_LABELS: Record<SortOption, string> = {
  recent: 'Mais recentes',
  value: 'Maior valor',
  distance: 'Mais próximas',
}

function Banner() {
  return (
    <View style={styles.banner}>
      <Ionicons name="sparkles-outline" size={16} color="#2563eb" style={styles.bannerIcon} />
      <Text style={styles.bannerText}>
        <Text style={styles.bannerTextStrong}>Como funcionam as oportunidades?</Text> São vagas
        abertas para candidatura. As empresas analisam os perfis e escolhem os creators.
      </Text>
    </View>
  )
}

function EmptyIllustration() {
  return (
    <View style={styles.emptyIcon}>
      <Ionicons name="sparkles-outline" size={18} color="#6a36d5" />
    </View>
  )
}

function AddressIllustration() {
  return (
    <View style={styles.emptyIcon}>
      <Ionicons name="location-outline" size={18} color="#6a36d5" />
    </View>
  )
}

function ErrorIllustration() {
  return (
    <View style={styles.emptyIcon}>
      <Ionicons name="alert-circle-outline" size={18} color="#6a36d5" />
    </View>
  )
}

function FilterChip({
  label,
  selected,
  onPress,
}: {
  label: string
  selected: boolean
  onPress: () => void
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.filterChip,
        selected && styles.filterChipSelected,
        pressed && styles.pressed,
      ]}
    >
      <Text style={[styles.filterChipText, selected && styles.filterChipTextSelected]}>
        {label}
      </Text>
    </Pressable>
  )
}

function SkeletonLine({ width, height = 12 }: { width: string | number; height?: number }) {
  return (
    <View
      style={[styles.skeletonLine, { width: width as number, height, borderRadius: height / 2 }]}
    />
  )
}

function OpportunityListSkeleton({ items = 4 }: { items?: number }) {
  return (
    <View style={styles.list}>
      {Array.from({ length: items }).map((_, index) => (
        <View key={index} style={styles.skeletonCard}>
          <View style={styles.skeletonHeader}>
            <SkeletonLine width="36%" height={18} />
            <View style={styles.skeletonAmountWrap}>
              <SkeletonLine width={36} height={10} />
              <SkeletonLine width={82} height={22} />
            </View>
          </View>
          <View style={styles.skeletonBody}>
            <SkeletonLine width="92%" />
            <SkeletonLine width="68%" />
          </View>
          <View style={styles.skeletonMeta}>
            <SkeletonLine width="42%" />
            <SkeletonLine width="38%" />
            <SkeletonLine width="88%" />
          </View>
        </View>
      ))}
    </View>
  )
}

export default function OportunidadesScreen() {
  const router = useRouter()
  const [sortBy, setSortBy] = useState<SortOption>('recent')
  const [filters, setFilters] = useState<OpportunityFilters>(DEFAULT_FILTERS)
  const [draftFilters, setDraftFilters] = useState<OpportunityFilters>(DEFAULT_FILTERS)
  const [filtersOpen, setFiltersOpen] = useState(false)

  const query = useInfiniteOpportunitiesQuery(24)

  const rawItems = flattenOpportunityPages(query.data)
  const openItems = useMemo(() => selectDisplayableOpenOpportunities(rawItems), [rawItems])
  const workTypes = useMemo(() => extractWorkTypes(openItems), [openItems])
  const filteredItems = useMemo(() => filterOpportunities(openItems, filters), [openItems, filters])
  const sortedItems = useMemo(
    () => sortOpportunities(filteredItems, sortBy),
    [filteredItems, sortBy],
  )

  const hasLoadedItems = openItems.length > 0
  const hasVisibleItems = sortedItems.length > 0
  const hasAddressError = isAddressRequiredError(query.error)
  const hasActiveFilters =
    filters.workType !== DEFAULT_FILTERS.workType || filters.distance !== DEFAULT_FILTERS.distance

  const showInitialLoading = query.isLoading && !hasLoadedItems
  const showAddressBlocked = !hasLoadedItems && hasAddressError
  const showGenericError = !hasLoadedItems && Boolean(query.error) && !hasAddressError
  const showEmptyWithoutFilters =
    !showInitialLoading &&
    !showAddressBlocked &&
    !showGenericError &&
    !hasActiveFilters &&
    !hasLoadedItems
  const showEmptyWithFilters =
    !showInitialLoading &&
    !showAddressBlocked &&
    !showGenericError &&
    hasActiveFilters &&
    !hasVisibleItems

  const showBanner = !showAddressBlocked
  const showInlineError = hasLoadedItems && Boolean(query.error) && !hasAddressError

  function openFilterModal() {
    setDraftFilters(filters)
    setFiltersOpen(true)
  }

  function applyFilters() {
    setFilters(draftFilters)
    setFiltersOpen(false)
  }

  function clearFilters() {
    setFilters(DEFAULT_FILTERS)
    setDraftFilters(DEFAULT_FILTERS)
    setFiltersOpen(false)
  }

  function onRefresh() {
    void query.refetch()
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={query.isRefetching && !query.isFetchingNextPage}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
      >
        <View style={styles.header}>
          <AppScreenHeader title="Oportunidades" />
        </View>

        {showBanner ? <Banner /> : null}

        {!showInitialLoading && !showAddressBlocked && !showGenericError ? (
          <View style={styles.toolbar}>
            <View style={styles.toolbarInfo}>
              <Text style={styles.toolbarSubtitle}>
                {sortedItems.length} {sortedItems.length === 1 ? 'vaga aberta' : 'vagas abertas'}
              </Text>
            </View>

            <View style={styles.toolbarActions}>
              <Pressable
                style={({ pressed }) => [styles.toolbarButton, pressed && styles.pressed]}
                onPress={openFilterModal}
              >
                <Ionicons name="options-outline" size={14} color={colors.text.primary.light} />
                <Text style={styles.toolbarButtonText}>Filtros</Text>
                {hasActiveFilters ? (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>
                      {
                        [filters.workType !== 'all', filters.distance !== 'all'].filter(Boolean)
                          .length
                      }
                    </Text>
                  </View>
                ) : null}
              </Pressable>

              <Pressable
                style={({ pressed }) => [styles.toolbarButton, pressed && styles.pressed]}
                onPress={() =>
                  setSortBy((current) =>
                    current === 'recent' ? 'value' : current === 'value' ? 'distance' : 'recent',
                  )
                }
              >
                <Text style={styles.toolbarButtonText}>{SORT_LABELS[sortBy]}</Text>
              </Pressable>
            </View>
          </View>
        ) : null}

        {showInitialLoading ? <OpportunityListSkeleton items={4} /> : null}

        {showAddressBlocked ? (
          <View style={styles.cardWrap}>
            <MobileEmptyState
              icon={<AddressIllustration />}
              title="Adicione seu endereço para ver oportunidades"
              description="Adicione seu endereço no perfil para visualizar vagas perto de você."
              actions={
                <View style={styles.centeredActions}>
                  <Pressable
                    style={({ pressed }) => [styles.outlineButton, pressed && styles.pressed]}
                    onPress={() => router.push('/(creator)/perfil' as never)}
                  >
                    <Text style={styles.outlineButtonText}>Completar perfil</Text>
                  </Pressable>
                </View>
              }
            />
          </View>
        ) : null}

        {showGenericError ? (
          <View style={styles.cardWrap}>
            <MobileEmptyState
              icon={<ErrorIllustration />}
              title="Erro ao carregar oportunidades"
              description="Tente novamente em instantes."
              actions={
                <View style={styles.centeredActions}>
                  <Pressable
                    style={({ pressed }) => [styles.outlineButton, pressed && styles.pressed]}
                    onPress={() => void query.refetch()}
                  >
                    <Text style={styles.outlineButtonText}>Tentar novamente</Text>
                  </Pressable>
                </View>
              }
            />
          </View>
        ) : null}

        {showEmptyWithoutFilters ? (
          <View style={styles.cardWrap}>
            <MobileEmptyState
              icon={<EmptyIllustration />}
              title="Nenhuma oportunidade disponível"
              description="Novas oportunidades aparecem aqui quando empresas abrirem vagas. Volte em breve."
            />
          </View>
        ) : null}

        {showEmptyWithFilters ? (
          <View style={styles.cardWrap}>
            <MobileEmptyState
              icon={<EmptyIllustration />}
              title="Nenhuma vaga com esses filtros"
              description="Tente ajustar ou limpar os filtros para ver mais oportunidades."
              actions={
                <View style={styles.centeredActions}>
                  <Pressable
                    style={({ pressed }) => [styles.outlineButton, pressed && styles.pressed]}
                    onPress={clearFilters}
                  >
                    <Text style={styles.outlineButtonText}>Limpar filtros</Text>
                  </Pressable>
                </View>
              }
            />
          </View>
        ) : null}

        {!showInitialLoading && !showAddressBlocked && !showGenericError && hasVisibleItems ? (
          <>
            {showInlineError ? (
              <View style={styles.inlineError}>
                <Text style={styles.inlineErrorText}>
                  Não foi possível atualizar a lista. Exibindo os dados já carregados.
                </Text>
              </View>
            ) : null}

            <View style={styles.list}>
              {sortedItems.map((item) => (
                <OpportunityCard key={item.id} item={item} />
              ))}
            </View>

            {query.hasNextPage ? (
              <View style={styles.footerAction}>
                <Pressable
                  style={({ pressed }) => [
                    styles.loadMoreButton,
                    (pressed || query.isFetchingNextPage) && styles.pressed,
                  ]}
                  disabled={query.isFetchingNextPage}
                  onPress={() => void query.fetchNextPage()}
                >
                  <Text style={styles.loadMoreText}>
                    {query.isFetchingNextPage ? 'Carregando...' : 'Carregar mais oportunidades'}
                  </Text>
                </Pressable>
              </View>
            ) : null}
          </>
        ) : null}
      </ScrollView>

      <Modal
        visible={filtersOpen}
        animationType="slide"
        transparent
        onRequestClose={() => setFiltersOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <Pressable style={styles.modalBackdrop} onPress={() => setFiltersOpen(false)} />
          <View style={styles.modalSheet}>
            <View style={styles.handle} />
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filtros</Text>
              <Pressable onPress={() => setFiltersOpen(false)}>
                <Ionicons name="close" size={20} color={colors.text.secondary.light} />
              </Pressable>
            </View>

            <Text style={styles.modalLabel}>Tipo de trabalho</Text>
            <View style={styles.chipGroup}>
              <FilterChip
                label="Todos os tipos"
                selected={draftFilters.workType === 'all'}
                onPress={() => setDraftFilters((current) => ({ ...current, workType: 'all' }))}
              />
              {workTypes.map((workType) => (
                <FilterChip
                  key={workType}
                  label={workType}
                  selected={draftFilters.workType === workType}
                  onPress={() => setDraftFilters((current) => ({ ...current, workType }))}
                />
              ))}
            </View>

            <Text style={styles.modalLabel}>Distância máxima</Text>
            <View style={styles.chipGroup}>
              {[
                ['all', 'Qualquer distância'],
                ['5', 'Até 5 km'],
                ['10', 'Até 10 km'],
                ['20', 'Até 20 km'],
                ['50', 'Até 50 km'],
              ].map(([value, label]) => (
                <FilterChip
                  key={value}
                  label={label}
                  selected={draftFilters.distance === value}
                  onPress={() =>
                    setDraftFilters((current) => ({
                      ...current,
                      distance: value as OpportunityFilters['distance'],
                    }))
                  }
                />
              ))}
            </View>

            <View style={styles.modalActions}>
              <Pressable
                style={({ pressed }) => [styles.secondaryAction, pressed && styles.pressed]}
                onPress={clearFilters}
              >
                <Text style={styles.secondaryActionText}>Limpar</Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [styles.primaryAction, pressed && styles.pressed]}
                onPress={applyFilters}
              >
                <Text style={styles.primaryActionText}>Aplicar</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f6f5f8',
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 32,
    gap: 16,
  },
  header: {
    paddingHorizontal: 0,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#bfdbfe',
    backgroundColor: '#eff6ff',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  bannerIcon: {
    marginTop: 2,
  },
  bannerText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
    color: '#1d4ed8',
  },
  bannerTextStrong: {
    fontWeight: '800',
    color: '#1e3a8a',
  },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  toolbarInfo: {
    alignSelf: 'center',
  },
  toolbarSubtitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748b',
  },
  toolbarActions: {
    flexDirection: 'row',
    gap: 8,
  },
  toolbarButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#dbe4ef',
    backgroundColor: colors.surface.light,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  toolbarButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0f172a',
  },
  badge: {
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#fff',
  },
  cardWrap: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: colors.surface.light,
    paddingHorizontal: 16,
  },
  centeredActions: {
    alignItems: 'center',
  },
  outlineButton: {
    borderWidth: 1,
    borderColor: 'rgba(106,54,213,0.35)',
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 9,
  },
  outlineButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#6a36d5',
  },
  list: {
    gap: 14,
  },
  skeletonCard: {
    backgroundColor: colors.surface.light,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 18,
    opacity: 0.55,
    gap: 14,
  },
  skeletonHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  skeletonAmountWrap: {
    alignItems: 'flex-end',
    gap: 8,
  },
  skeletonBody: {
    gap: 8,
  },
  skeletonMeta: {
    gap: 10,
  },
  skeletonLine: {
    backgroundColor: colors.border.light,
  },
  inlineError: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#fecaca',
    backgroundColor: '#fff7f7',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  inlineErrorText: {
    fontSize: 12,
    lineHeight: 18,
    color: '#b91c1c',
  },
  footerAction: {
    alignItems: 'center',
    paddingTop: 4,
  },
  loadMoreButton: {
    borderWidth: 1,
    borderColor: '#dbe4ef',
    borderRadius: 999,
    backgroundColor: colors.surface.light,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  loadMoreText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  modalSheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    backgroundColor: colors.surface.light,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 32,
    gap: 14,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 999,
    backgroundColor: '#cbd5e1',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0f172a',
  },
  modalLabel: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.9,
    color: '#64748b',
  },
  chipGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterChip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#dbe4ef',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#fff',
  },
  filterChipSelected: {
    borderColor: 'rgba(106,54,213,0.45)',
    backgroundColor: '#f5f3ff',
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
  },
  filterChipTextSelected: {
    color: '#6a36d5',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    paddingTop: 4,
  },
  secondaryAction: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#dbe4ef',
    paddingVertical: 12,
  },
  secondaryActionText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#334155',
  },
  primaryAction: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,
    backgroundColor: '#6a36d5',
    paddingVertical: 12,
  },
  primaryActionText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#fff',
  },
  emptyIcon: {
    width: 36,
    height: 36,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0ebff',
  },
  pressed: {
    opacity: 0.84,
  },
})

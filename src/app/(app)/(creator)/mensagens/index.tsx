import { useMemo, useState } from 'react'
import {
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { colors } from '@/theme/colors'
import { AppScreenHeader } from '@/components/AppScreenHeader'
import { useConversationsQuery } from '@/modules/chat/queries'
import type { ConversationListItem } from '@/modules/chat/types'
import { ConversationItem } from './_components/ConversationItem'

type ConversationFilter = 'all' | 'unread' | 'active'

const FILTERS: { id: ConversationFilter; label: string }[] = [
  { id: 'all', label: 'Todas' },
  { id: 'unread', label: 'Não lidas' },
  { id: 'active', label: 'Em andamento' },
]

function sortConversations(conversations: ConversationListItem[]): ConversationListItem[] {
  return [...conversations].sort((a, b) => {
    const aTime = new Date(a.lastMessageAt ?? a.createdAt).getTime()
    const bTime = new Date(b.lastMessageAt ?? b.createdAt).getTime()
    if (bTime !== aTime) return bTime - aTime
    if (b.unreadCount !== a.unreadCount) return b.unreadCount - a.unreadCount
    return b.id.localeCompare(a.id)
  })
}

function getParticipantName(c: ConversationListItem): string {
  return c.participant?.name ?? 'Participante'
}

function getLastMessageContent(c: ConversationListItem): string {
  return c.lastMessage?.content ?? 'Sem mensagens ainda'
}

function getTimeLabel(c: ConversationListItem): string {
  const base = c.lastMessageAt ?? c.createdAt
  const date = new Date(base)
  const now = new Date()
  const sameDay =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear()

  return sameDay
    ? date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    : date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
}

function ConversationSkeleton() {
  return (
    <View style={skeletonStyles.container}>
      {Array.from({ length: 6 }).map((_, i) => (
        <View key={i} style={skeletonStyles.row}>
          <View style={skeletonStyles.avatar} />
          <View style={skeletonStyles.lines}>
            <View style={skeletonStyles.lineShort} />
            <View style={skeletonStyles.lineLong} />
          </View>
        </View>
      ))}
    </View>
  )
}

const skeletonStyles = StyleSheet.create({
  container: { gap: 4, paddingHorizontal: 16 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14 },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#e2e8f0' },
  lines: { flex: 1, gap: 8 },
  lineShort: { height: 12, width: 120, borderRadius: 6, backgroundColor: '#e2e8f0' },
  lineLong: { height: 10, width: '80%', borderRadius: 6, backgroundColor: '#f1f5f9' },
})

function EmptyInitial() {
  return (
    <View style={emptyStyles.container}>
      <View style={emptyStyles.iconWrap}>
        <Ionicons name="chatbubbles-outline" size={32} color={colors.primary} />
      </View>
      <Text style={emptyStyles.title}>Você ainda não tem conversas</Text>
      <Text style={emptyStyles.description}>
        Quando uma campanha for aceita, a conversa com a marca aparecerá aqui.
      </Text>
    </View>
  )
}

function EmptyFiltered({ filter }: { filter: ConversationFilter }) {
  const message =
    filter === 'unread'
      ? 'Nenhuma conversa não lida no momento.'
      : 'Nenhuma conversa em andamento. Veja em "Todas".'
  return (
    <View style={emptyStyles.container}>
      <Text style={emptyStyles.filterMessage}>{message}</Text>
    </View>
  )
}

const emptyStyles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 16 },
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#ede9fb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontSize: 17, fontWeight: '700', color: colors.text.primary.light, textAlign: 'center' },
  description: {
    fontSize: 14,
    color: colors.text.secondary.light,
    textAlign: 'center',
    lineHeight: 20,
  },
  filterMessage: { fontSize: 14, color: colors.text.secondary.light, textAlign: 'center' },
})

export default function MensagensScreen() {
  const router = useRouter()
  const [activeFilter, setActiveFilter] = useState<ConversationFilter>('all')
  const conversationsQuery = useConversationsQuery()

  const ordered = useMemo(
    () => sortConversations(conversationsQuery.data ?? []),
    [conversationsQuery.data],
  )

  const filtered = useMemo(() => {
    if (activeFilter === 'unread') return ordered.filter((c) => c.unreadCount > 0)
    if (activeFilter === 'active') return ordered.filter((c) => !c.closedAt)
    return ordered
  }, [activeFilter, ordered])

  function handlePress(conversationId: string) {
    router.push(`/(creator)/mensagens/${conversationId}` as never)
  }

  const renderItem = ({ item }: { item: ConversationListItem }) => (
    <ConversationItem
      id={item.id}
      participantName={getParticipantName(item)}
      avatarUrl={item.participant?.avatarUrl ?? null}
      lastMessageContent={getLastMessageContent(item)}
      timeLabel={getTimeLabel(item)}
      unreadCount={item.unreadCount}
      isClosed={Boolean(item.closedAt)}
      onPress={handlePress}
    />
  )

  const hasAnyConversations = ordered.length > 0
  const isFirstLoad = conversationsQuery.isLoading && !conversationsQuery.data

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <AppScreenHeader title="Mensagens" />
      </View>

      {isFirstLoad ? (
        <ConversationSkeleton />
      ) : conversationsQuery.isError ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Não foi possível carregar as conversas.</Text>
          <Pressable onPress={() => void conversationsQuery.refetch()} style={styles.retryButton}>
            <Text style={styles.retryText}>Tentar novamente</Text>
          </Pressable>
        </View>
      ) : (
        <>
          {hasAnyConversations ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filtersContent}
              style={styles.filters}
            >
              {FILTERS.map((f) => (
                <Pressable
                  key={f.id}
                  onPress={() => setActiveFilter(f.id)}
                  style={[styles.filterPill, activeFilter === f.id && styles.filterPillActive]}
                  accessibilityRole="button"
                  accessibilityState={{ selected: activeFilter === f.id }}
                >
                  <Text
                    style={[styles.filterLabel, activeFilter === f.id && styles.filterLabelActive]}
                  >
                    {f.label}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          ) : null}

          {!hasAnyConversations ? (
            <EmptyInitial />
          ) : filtered.length === 0 ? (
            <EmptyFiltered filter={activeFilter} />
          ) : (
            <FlatList
              data={filtered}
              renderItem={renderItem}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl
                  refreshing={conversationsQuery.isRefetching}
                  onRefresh={() => void conversationsQuery.refetch()}
                  tintColor={colors.primary}
                />
              }
            />
          )}
        </>
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
  },
  filters: {
    flexGrow: 0,
    marginBottom: 8,
  },
  filtersContent: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  filterPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 100,
    backgroundColor: colors.surface.light,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  filterPillActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text.secondary.light,
  },
  filterLabelActive: {
    color: '#fff',
  },
  listContent: {
    paddingVertical: 4,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: 24,
  },
  errorText: {
    fontSize: 14,
    color: colors.text.secondary.light,
    textAlign: 'center',
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  retryText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
})

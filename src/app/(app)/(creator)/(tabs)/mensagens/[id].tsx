import { useEffect, useMemo, useRef, useState } from 'react'
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { Image } from 'expo-image'
import { Ionicons } from '@expo/vector-icons'
import { colors } from '@/theme/colors'
import { useSession } from '@/hooks/useSession'
import {
  useConversationMessagesInfiniteQuery,
  useConversationsQuery,
  useSendConversationMessageMutation,
} from '@/modules/chat/queries'
import type { ConversationListItem, ConversationMessageItem, LocalMessage } from '@/modules/chat/types'
import { MessageBubble } from './_components/MessageBubble'
import { MessageInput } from './_components/MessageInput'

// ─── helpers ────────────────────────────────────────────────────────────────

function mergeUniqueMessages(items: (ConversationMessageItem | LocalMessage)[]): LocalMessage[] {
  const map = new Map<string, LocalMessage>()
  for (const item of items) {
    map.set(item.id, item as LocalMessage)
  }
  return Array.from(map.values())
}

function makeLocalMessage(
  content: string,
  conversationId: string,
  userId: string,
): LocalMessage {
  return {
    id: `local-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    conversationId,
    senderUserId: userId,
    content,
    contentType: 'TEXT',
    createdAt: new Date().toISOString(),
    deliveryStatus: 'sending',
  }
}

// ─── ChatThreadHeader ────────────────────────────────────────────────────────

type HeaderProps = {
  conversation: ConversationListItem | null | undefined
  onBack: () => void
}

function ChatThreadHeader({ conversation, onBack }: HeaderProps) {
  const insets = useSafeAreaInsets()
  const participantName = conversation?.participant?.name ?? 'Conversa'
  const avatarUrl = conversation?.participant?.avatarUrl ?? null
  const isClosed = Boolean(conversation?.closedAt)

  const initials = participantName
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('')

  return (
    <View style={[headerStyles.container, { paddingTop: insets.top + 8 }]}>
      <Pressable
        onPress={onBack}
        style={({ pressed }) => [headerStyles.backButton, pressed && headerStyles.backButtonPressed]}
        accessibilityRole="button"
        accessibilityLabel="Voltar para conversas"
      >
        <Ionicons name="chevron-back" size={24} color={colors.text.primary.light} />
      </Pressable>

      {avatarUrl ? (
        <Image
          source={{ uri: avatarUrl }}
          style={headerStyles.avatar}
          contentFit="cover"
          cachePolicy="memory-disk"
        />
      ) : (
        <View style={headerStyles.avatarFallback}>
          <Text style={headerStyles.avatarInitials}>{initials}</Text>
        </View>
      )}

      <View style={headerStyles.info}>
        <Text style={headerStyles.name} numberOfLines={1}>
          {participantName}
        </Text>
        <View style={[headerStyles.statusBadge, isClosed && headerStyles.statusBadgeClosed]}>
          <Text style={[headerStyles.statusLabel, isClosed && headerStyles.statusLabelClosed]}>
            {isClosed ? 'Finalizada' : 'Em andamento'}
          </Text>
        </View>
      </View>
    </View>
  )
}

const headerStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingBottom: 12,
    gap: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border.light,
    backgroundColor: colors.surface.light,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonPressed: { backgroundColor: '#f1f5f9' },
  avatar: { width: 38, height: 38, borderRadius: 19 },
  avatarFallback: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: { fontSize: 13, fontWeight: '700', color: '#475569' },
  info: { flex: 1, gap: 3 },
  name: { fontSize: 15, fontWeight: '700', color: colors.text.primary.light },
  statusBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#ede9fb',
    borderRadius: 100,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  statusBadgeClosed: { backgroundColor: '#f1f5f9' },
  statusLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#7c3aed',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  statusLabelClosed: { color: '#94a3b8' },
})

// ─── MessageSkeleton ─────────────────────────────────────────────────────────

function MessageSkeleton() {
  return (
    <View style={skeletonStyles.container}>
      <View style={[skeletonStyles.bubble, skeletonStyles.bubbleLeft, { width: '60%' }]} />
      <View style={[skeletonStyles.bubble, skeletonStyles.bubbleRight, { width: '70%' }]} />
      <View style={[skeletonStyles.bubble, skeletonStyles.bubbleLeft, { width: '45%' }]} />
      <View style={[skeletonStyles.bubble, skeletonStyles.bubbleRight, { width: '55%' }]} />
    </View>
  )
}

const skeletonStyles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 10, justifyContent: 'flex-end' },
  bubble: { height: 44, borderRadius: 18, borderCurve: 'continuous' } as object,
  bubbleLeft: { alignSelf: 'flex-start', backgroundColor: '#f1f5f9' },
  bubbleRight: { alignSelf: 'flex-end', backgroundColor: 'rgba(137,90,246,0.15)' },
})

// ─── Main screen ─────────────────────────────────────────────────────────────

export default function ChatThreadScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const { user } = useSession()

  // Resolve conversation metadata from the list cache
  const conversationsQuery = useConversationsQuery()
  const conversation = useMemo(
    () => conversationsQuery.data?.find((c) => c.id === id) ?? null,
    [conversationsQuery.data, id],
  )

  const messagesQuery = useConversationMessagesInfiniteQuery(id)
  const sendMutation = useSendConversationMessageMutation(id)

  const [localMessages, setLocalMessages] = useState<LocalMessage[]>([])
  const [lastInputError, setLastInputError] = useState<string | null>(null)

  // Reset local state when conversation changes
  useEffect(() => {
    setLocalMessages([])
    setLastInputError(null)
  }, [id])

  // Server messages: pages are DESC (newest first) — keep that order for inverted FlatList
  const serverMessages = useMemo<LocalMessage[]>(() => {
    const raw = messagesQuery.data?.pages.flatMap((page) => page.items) ?? []
    return mergeUniqueMessages(raw)
  }, [messagesQuery.data])

  // Remove local messages that have been confirmed by the server
  useEffect(() => {
    if (!serverMessages.length) return
    const serverIds = new Set(serverMessages.map((m) => m.id))
    setLocalMessages((prev) =>
      prev.filter((m) => !(m.deliveryStatus === 'sent' && serverIds.has(m.id))),
    )
  }, [serverMessages])

  // Final ordered list: newest first (for inverted FlatList)
  const orderedMessages = useMemo<LocalMessage[]>(() => {
    const all = [...serverMessages, ...localMessages]
    return mergeUniqueMessages(all).sort((a, b) => {
      const aTime = new Date(a.createdAt).getTime()
      const bTime = new Date(b.createdAt).getTime()
      if (bTime !== aTime) return bTime - aTime // DESC: newest first
      return b.id.localeCompare(a.id)
    })
  }, [serverMessages, localMessages])

  // ── Send flow ──────────────────────────────────────────────────────────────

  async function handleSend(content: string) {
    const local = makeLocalMessage(content, id, user?.id ?? '')
    setLocalMessages((prev) => [local, ...prev])
    setLastInputError(null)

    try {
      const sent = await sendMutation.mutateAsync(content)
      setLocalMessages((prev) =>
        prev.map((m) => (m.id === local.id ? { ...sent, deliveryStatus: 'sent' as const } : m)),
      )
    } catch {
      setLocalMessages((prev) =>
        prev.map((m) =>
          m.id === local.id
            ? { ...m, deliveryStatus: 'failed', localError: 'Falha ao enviar' }
            : m,
        ),
      )
      setLastInputError('Falha ao enviar mensagem. Tente novamente.')
    }
  }

  async function handleRetry(messageId: string) {
    const target = localMessages.find((m) => m.id === messageId)
    if (!target || target.deliveryStatus !== 'failed') return

    setLocalMessages((prev) =>
      prev.map((m) =>
        m.id === messageId ? { ...m, deliveryStatus: 'sending', localError: undefined } : m,
      ),
    )
    setLastInputError(null)

    try {
      const sent = await sendMutation.mutateAsync(target.content)
      setLocalMessages((prev) =>
        prev.map((m) => (m.id === messageId ? { ...sent, deliveryStatus: 'sent' as const } : m)),
      )
    } catch {
      setLocalMessages((prev) =>
        prev.map((m) =>
          m.id === messageId
            ? { ...m, deliveryStatus: 'failed', localError: 'Falha ao reenviar' }
            : m,
        ),
      )
      setLastInputError('Não foi possível reenviar. Tente novamente.')
    }
  }

  const lastFailedMessageId = localMessages.find((m) => m.deliveryStatus === 'failed')?.id

  // ── Render helpers ─────────────────────────────────────────────────────────

  const isClosed = Boolean(conversation?.closedAt)
  const isFirstLoad = messagesQuery.isLoading && !messagesQuery.data

  const renderItem = ({ item }: { item: LocalMessage }) => (
    <MessageBubble
      message={item}
      isMine={item.senderUserId === user?.id}
      onRetry={handleRetry}
    />
  )

  const keyboardOffset = Platform.select({ ios: 0, android: 0 })

  return (
    <View style={styles.container}>
      {/* Custom header — Stack has headerShown: false */}
      <ChatThreadHeader conversation={conversation} onBack={() => router.back()} />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={keyboardOffset}
      >
        {isFirstLoad ? (
          <MessageSkeleton />
        ) : messagesQuery.isError ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Não foi possível carregar as mensagens.</Text>
            <Pressable
              onPress={() => void messagesQuery.refetch()}
              style={styles.retryButton}
            >
              <Text style={styles.retryButtonText}>Tentar novamente</Text>
            </Pressable>
          </View>
        ) : orderedMessages.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Ainda não há mensagens.</Text>
            <Text style={styles.emptySubText}>Seja o primeiro a escrever!</Text>
          </View>
        ) : (
          <FlatList
            data={orderedMessages}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            inverted
            contentContainerStyle={styles.messageList}
            showsVerticalScrollIndicator={false}
            keyboardDismissMode="interactive"
            keyboardShouldPersistTaps="handled"
            // Paginação: com FlatList invertida, onEndReached dispara ao subir (mensagens antigas)
            onEndReached={() => {
              if (messagesQuery.hasNextPage && !messagesQuery.isFetchingNextPage) {
                void messagesQuery.fetchNextPage()
              }
            }}
            onEndReachedThreshold={0.3}
            ListFooterComponent={
              // Com FlatList invertida, ListFooterComponent aparece no topo visual (mensagens antigas)
              messagesQuery.isFetchingNextPage ? (
                <View style={styles.loadingOlderContainer}>
                  <ActivityIndicator size="small" color={colors.primary} />
                  <Text style={styles.loadingOlderText}>Carregando mensagens antigas...</Text>
                </View>
              ) : null
            }
          />
        )}

        <SafeAreaView edges={['bottom']} style={styles.inputSafeArea}>
          <MessageInput
            onSend={(content) => void handleSend(content)}
            onRetryLastFailed={
              lastFailedMessageId ? () => void handleRetry(lastFailedMessageId) : undefined
            }
            isSending={sendMutation.isPending}
            errorMessage={lastInputError}
            disabled={isClosed || sendMutation.isPending}
          />
          {isClosed ? (
            <View style={styles.closedBanner}>
              <Text style={styles.closedBannerText}>Esta conversa foi encerrada.</Text>
            </View>
          ) : null}
        </SafeAreaView>
      </KeyboardAvoidingView>

      {/* LIMITAÇÃO: backend não possui endpoint de mark-as-read.
          O unreadCount será atualizado pelo polling de 10s na lista de conversas. */}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface.light,
  },
  flex: { flex: 1 },
  messageList: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexGrow: 1,
  },
  loadingOlderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
  },
  loadingOlderText: {
    fontSize: 12,
    color: colors.text.secondary.light,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    gap: 6,
  },
  emptyText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text.primary.light,
  },
  emptySubText: {
    fontSize: 13,
    color: colors.text.secondary.light,
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
  retryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  inputSafeArea: {
    backgroundColor: colors.surface.light,
  },
  closedBanner: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    alignItems: 'center',
  },
  closedBannerText: {
    fontSize: 12,
    color: colors.text.secondary.light,
    fontStyle: 'italic',
  },
})

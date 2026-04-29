import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native'
import Animated, { FadeIn } from 'react-native-reanimated'
import { Ionicons } from '@expo/vector-icons'
import { colors } from '@/theme/colors'
import type { LocalMessage } from '@/modules/chat/types'

type Props = {
  message: LocalMessage
  isMine: boolean
  onRetry: (messageId: string) => void
}

function formatTime(isoString: string): string {
  return new Date(isoString).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function MessageBubble({ message, isMine, onRetry }: Props) {
  const isSending = message.deliveryStatus === 'sending'
  const isFailed = message.deliveryStatus === 'failed'

  return (
    <Animated.View
      entering={FadeIn.duration(150)}
      style={[styles.wrapper, isMine ? styles.wrapperMine : styles.wrapperTheirs]}
    >
      <Animated.View style={[styles.bubble, isMine ? styles.bubbleMine : styles.bubbleTheirs]}>
        <Text style={[styles.content, isMine ? styles.contentMine : styles.contentTheirs]}>
          {message.content}
        </Text>

        <Animated.View style={styles.meta}>
          <Text style={[styles.time, isMine ? styles.timeMine : styles.timeTheirs]}>
            {formatTime(message.createdAt)}
          </Text>

          {isSending ? (
            <ActivityIndicator size={10} color={isMine ? 'rgba(255,255,255,0.7)' : '#94a3b8'} />
          ) : null}

          {isMine && !isSending && !isFailed ? (
            <Ionicons name="checkmark-done" size={12} color="rgba(255,255,255,0.7)" />
          ) : null}

          {isFailed ? (
            <Ionicons
              name="alert-circle"
              size={12}
              color={isMine ? 'rgba(254,202,202,1)' : '#ef4444'}
            />
          ) : null}
        </Animated.View>

        {isFailed ? (
          <Pressable
            onPress={() => onRetry(message.id)}
            style={styles.retryButton}
            accessibilityRole="button"
            accessibilityLabel="Tentar novamente"
          >
            <Text style={[styles.retryText, isMine ? styles.retryTextMine : styles.retryTextTheirs]}>
              Tentar novamente
            </Text>
          </Pressable>
        ) : null}
      </Animated.View>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  wrapperMine: {
    justifyContent: 'flex-end',
  },
  wrapperTheirs: {
    justifyContent: 'flex-start',
  },
  bubble: {
    maxWidth: '78%',
    borderRadius: 18,
    borderCurve: 'continuous',
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 4,
  } as object,
  bubbleMine: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: 4,
  },
  bubbleTheirs: {
    backgroundColor: '#f1f5f9',
    borderBottomLeftRadius: 4,
  },
  content: {
    fontSize: 14,
    lineHeight: 20,
  },
  contentMine: {
    color: '#fff',
  },
  contentTheirs: {
    color: colors.text.primary.light,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
  },
  time: {
    fontSize: 11,
    fontWeight: '500',
  },
  timeMine: {
    color: 'rgba(255,255,255,0.75)',
  },
  timeTheirs: {
    color: '#94a3b8',
  },
  retryButton: {
    marginTop: 2,
    alignSelf: 'flex-end',
  },
  retryText: {
    fontSize: 12,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  retryTextMine: {
    color: 'rgba(254,202,202,1)',
  },
  retryTextTheirs: {
    color: '#ef4444',
  },
})

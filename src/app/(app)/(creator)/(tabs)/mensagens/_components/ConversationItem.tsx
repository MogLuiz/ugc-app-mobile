import { Pressable, StyleSheet, Text, View } from 'react-native'
import { Image } from 'expo-image'
import { colors } from '@/theme/colors'

type Props = {
  id: string
  participantName: string
  avatarUrl: string | null
  lastMessageContent: string
  timeLabel: string
  unreadCount: number
  isClosed: boolean
  onPress: (id: string) => void
}

export function ConversationItem({
  id,
  participantName,
  avatarUrl,
  lastMessageContent,
  timeLabel,
  unreadCount,
  isClosed,
  onPress,
}: Props) {
  const hasUnread = unreadCount > 0
  const initials = participantName
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('')

  return (
    <Pressable
      style={({ pressed }) => [
        styles.container,
        hasUnread && styles.containerUnread,
        pressed && styles.containerPressed,
      ]}
      onPress={() => onPress(id)}
      accessibilityRole="button"
      accessibilityLabel={`Conversa com ${participantName}`}
    >
      {avatarUrl ? (
        <Image
          source={{ uri: avatarUrl }}
          style={styles.avatar}
          contentFit="cover"
          cachePolicy="memory-disk"
        />
      ) : (
        <View style={styles.avatarFallback}>
          <Text style={styles.avatarInitials}>{initials}</Text>
        </View>
      )}

      <View style={styles.content}>
        <View style={styles.row}>
          <Text style={[styles.name, hasUnread && styles.nameUnread]} numberOfLines={1}>
            {participantName}
          </Text>
          <Text style={[styles.time, hasUnread && styles.timeUnread]}>{timeLabel}</Text>
        </View>

        <Text style={[styles.preview, hasUnread && styles.previewUnread]} numberOfLines={1}>
          {lastMessageContent}
        </Text>

        <View style={styles.row}>
          <View style={[styles.statusBadge, isClosed && styles.statusBadgeClosed]}>
            <Text style={[styles.statusLabel, isClosed && styles.statusLabelClosed]}>
              {isClosed ? 'Finalizada' : 'Em andamento'}
            </Text>
          </View>

          {unreadCount > 0 ? (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadText}>{unreadCount > 99 ? '99+' : String(unreadCount)}</Text>
            </View>
          ) : null}
        </View>
      </View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
    borderRadius: 16,
    borderCurve: 'continuous',
  } as object,
  containerUnread: {
    backgroundColor: 'rgba(137,90,246,0.05)',
  },
  containerPressed: {
    opacity: 0.75,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginTop: 2,
  },
  avatarFallback: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  avatarInitials: {
    fontSize: 14,
    fontWeight: '700',
    color: '#475569',
  },
  content: {
    flex: 1,
    gap: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  name: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary.light,
  },
  nameUnread: {
    fontWeight: '700',
  },
  time: {
    fontSize: 11,
    fontWeight: '500',
    color: '#94a3b8',
  },
  timeUnread: {
    color: colors.primary,
    fontWeight: '700',
  },
  preview: {
    fontSize: 12,
    color: colors.text.secondary.light,
  },
  previewUnread: {
    color: '#334155',
    fontWeight: '500',
  },
  statusBadge: {
    backgroundColor: '#ede9fb',
    borderRadius: 100,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  statusBadgeClosed: {
    backgroundColor: '#f1f5f9',
  },
  statusLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#7c3aed',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  statusLabelClosed: {
    color: '#94a3b8',
  },
  unreadBadge: {
    backgroundColor: colors.primary,
    borderRadius: 100,
    paddingHorizontal: 7,
    paddingVertical: 2,
    minWidth: 22,
    alignItems: 'center',
  },
  unreadText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#fff',
  },
})

import { Pressable, StyleSheet, Text, View } from 'react-native'
import { Image } from 'expo-image'
import { Ionicons } from '@expo/vector-icons'
import { getInitials } from '@/lib/formatters'
import { colors } from '@/theme/colors'
import theme from '@/theme/theme'

type Props = {
  title?: string
  subtitle?: string
  userName?: string | null
  avatarUrl?: string | null
  onPressAvatar?: () => void
  onPressNotifications?: () => void
  unreadNotificationsCount?: number
}

const ACTION_TOUCH_SIZE = 44
const BELL_SIZE = 40
const AVATAR_SIZE = 36

function getAvatarFallback(userName?: string | null): string | null {
  const trimmedName = userName?.trim()
  if (!trimmedName) return null
  const initials = getInitials(trimmedName)
  return initials || null
}

export function CreatorDashboardHeader({
  title = 'Início',
  subtitle = 'Convites, campanhas e oportunidades.',
  userName,
  avatarUrl,
  onPressAvatar,
  onPressNotifications,
  unreadNotificationsCount = 0,
}: Props) {
  const initials = getAvatarFallback(userName)
  const unreadBadgeLabel = unreadNotificationsCount > 99 ? '99+' : String(unreadNotificationsCount)

  const avatarInner = (
    <View style={styles.avatar} accessibilityRole="image">
      {avatarUrl ? (
        <Image source={{ uri: avatarUrl }} style={styles.avatarImage} contentFit="cover" />
      ) : initials ? (
        <Text style={styles.avatarInitials}>{initials}</Text>
      ) : (
        <View style={styles.avatarNeutral} />
      )}
    </View>
  )

  return (
    <View style={styles.container}>
      <View style={styles.textBlock}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        <Text style={styles.subtitle} numberOfLines={2}>
          {subtitle}
        </Text>
      </View>

      <View style={styles.actionsGroup}>
        {onPressNotifications ? (
          <Pressable
            onPress={onPressNotifications}
            style={({ pressed }) => [styles.actionButton, pressed && styles.actionPressed]}
            accessibilityRole="button"
            accessibilityLabel="Abrir notificações"
            hitSlop={6}
          >
            <View style={styles.bellIconWrap}>
              <Ionicons name="notifications-outline" size={20} color={theme.colors.textStrong} />
            </View>
            {unreadNotificationsCount > 0 ? (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{unreadBadgeLabel}</Text>
              </View>
            ) : null}
          </Pressable>
        ) : null}

        {onPressAvatar ? (
          <Pressable
            onPress={onPressAvatar}
            style={({ pressed }) => [styles.actionButton, pressed && styles.actionPressed]}
            accessibilityRole="button"
            accessibilityLabel={
              userName?.trim() ? `Abrir menu de ${userName.trim()}` : 'Abrir menu da conta'
            }
            hitSlop={6}
          >
            {avatarInner}
          </Pressable>
        ) : (
          <View style={styles.actionButton}>{avatarInner}</View>
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    columnGap: 16,
    minHeight: ACTION_TOUCH_SIZE,
  },
  textBlock: {
    flex: 1,
    paddingTop: 2,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    lineHeight: 32,
    letterSpacing: -0.5,
    color: colors.text.primary.light,
  },
  subtitle: {
    marginTop: 6,
    fontSize: 14,
    lineHeight: 20,
    color: colors.text.secondary.light,
  },
  actionsGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexShrink: 0,
  },
  actionButton: {
    width: ACTION_TOUCH_SIZE,
    height: ACTION_TOUCH_SIZE,
    borderRadius: ACTION_TOUCH_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  bellIconWrap: {
    width: BELL_SIZE,
    height: BELL_SIZE,
    borderRadius: BELL_SIZE / 2,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: 'rgba(15,23,42,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 4,
  },
  actionPressed: {
    opacity: 0.72,
  },
  badge: {
    position: 'absolute',
    top: 1,
    right: 0,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 4,
    borderRadius: 9,
    backgroundColor: '#ef4444',
    borderWidth: 2,
    borderColor: colors.background.light,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: -0.1,
  },
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    backgroundColor: theme.colors.primarySurface,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(137,90,246,0.12)',
  },
  avatarImage: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
  },
  avatarInitials: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.primary,
  },
  avatarNeutral: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: theme.colors.primarySurfaceAlt,
  },
})

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

const AVATAR_SIZE = 44
const BELL_SIZE = 42
const TEXT_TO_AVATAR_SPACING = theme.spacing.s3

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
  const avatarContent = (
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

      {onPressAvatar ? (
        <View style={styles.actions}>
          {onPressNotifications ? (
            <Pressable
              onPress={onPressNotifications}
              style={({ pressed }) => [styles.bellButton, pressed && styles.actionPressed]}
              accessibilityRole="button"
              accessibilityLabel="Abrir notificações"
              hitSlop={8}
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

          <Pressable
            onPress={onPressAvatar}
            style={({ pressed }) => [styles.avatarButton, pressed && styles.actionPressed]}
            accessibilityRole="button"
            accessibilityLabel={
              userName?.trim() ? `Abrir perfil de ${userName.trim()}` : 'Abrir perfil'
            }
          >
            {avatarContent}
          </Pressable>
        </View>
      ) : (
        <View style={styles.actions}>
          {onPressNotifications ? (
            <Pressable
              onPress={onPressNotifications}
              style={({ pressed }) => [styles.bellButton, pressed && styles.actionPressed]}
              accessibilityRole="button"
              accessibilityLabel="Abrir notificações"
              hitSlop={8}
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

          <View style={styles.avatarButton}>{avatarContent}</View>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  textBlock: {
    flex: 1,
    minWidth: 0,
    paddingRight: TEXT_TO_AVATAR_SPACING,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 28,
    color: colors.text.primary.light,
  },
  subtitle: {
    marginTop: 4,
    fontSize: 14,
    lineHeight: 20,
    color: colors.text.secondary.light,
  },
  bellButton: {
    width: BELL_SIZE,
    height: BELL_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bellIconWrap: {
    width: BELL_SIZE,
    height: BELL_SIZE,
    borderRadius: BELL_SIZE / 2,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: 'rgba(137,90,246,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#1f2937',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  avatarButton: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    flexShrink: 0,
    borderRadius: AVATAR_SIZE / 2,
  },
  actionPressed: {
    opacity: 0.85,
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    minWidth: 20,
    height: 20,
    paddingHorizontal: 5,
    borderRadius: 10,
    backgroundColor: '#ef4444',
    borderWidth: 2,
    borderColor: '#f9fafb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontSize: 10,
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
  },
  avatarImage: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
  },
  avatarInitials: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.primary,
  },
  avatarNeutral: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: theme.colors.primarySurfaceAlt,
  },
})

import { Pressable, StyleSheet, Text, View } from 'react-native'
import { Image } from 'expo-image'
import { getInitials } from '@/lib/formatters'
import { colors } from '@/theme/colors'
import theme from '@/theme/theme'

type Props = {
  title?: string
  subtitle?: string
  userName?: string | null
  avatarUrl?: string | null
  onPressAvatar?: () => void
}

const AVATAR_SIZE = 44
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
}: Props) {
  const initials = getAvatarFallback(userName)
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
        <Pressable
          onPress={onPressAvatar}
          style={({ pressed }) => [styles.avatarButton, pressed && styles.avatarButtonPressed]}
          accessibilityRole="button"
          accessibilityLabel={
            userName?.trim() ? `Abrir perfil de ${userName.trim()}` : 'Abrir perfil'
          }
        >
          {avatarContent}
        </Pressable>
      ) : (
        <View style={styles.avatarButton}>{avatarContent}</View>
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
  avatarButton: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    flexShrink: 0,
    borderRadius: AVATAR_SIZE / 2,
  },
  avatarButtonPressed: {
    opacity: 0.85,
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

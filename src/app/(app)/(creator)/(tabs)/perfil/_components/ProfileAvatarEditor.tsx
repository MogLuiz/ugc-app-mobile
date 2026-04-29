import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native'
import { Image } from 'expo-image'
import { Ionicons } from '@expo/vector-icons'
import { colors } from '@/theme/colors'
import theme from '@/theme/theme'
import { getInitials } from '@/lib/formatters'

const AVATAR_SIZE = 88

type Props = {
  avatarUrl: string | null
  name: string
  isUploading: boolean
  onPickImage: () => void
}

export function ProfileAvatarEditor({ avatarUrl, name, isUploading, onPickImage }: Props) {
  const initials = name ? getInitials(name) : null

  return (
    <View style={styles.container}>
      <Pressable
        style={styles.avatarWrapper}
        onPress={onPickImage}
        disabled={isUploading}
      >
        {avatarUrl ? (
          <Image
            source={{ uri: avatarUrl }}
            contentFit="cover"
            cachePolicy="memory-disk"
            transition={200}
            style={styles.avatar}
          />
        ) : (
          <View style={styles.avatarFallback}>
            {initials ? (
              <Text style={styles.avatarInitials}>{initials}</Text>
            ) : (
              <Ionicons name="person" size={32} color={colors.primary} />
            )}
          </View>
        )}

        {isUploading ? (
          <View style={styles.uploadOverlay}>
            <ActivityIndicator color="#fff" size="small" />
          </View>
        ) : (
          <View style={styles.cameraButton}>
            <Ionicons name="camera" size={14} color="#fff" />
          </View>
        )}
      </Pressable>

      {name ? (
        <Text style={styles.name} numberOfLines={2}>
          {name}
        </Text>
      ) : null}

      <Text style={styles.hint}>Toque para alterar a foto</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: theme.spacing.s4,
    gap: theme.spacing.s2,
  },
  avatarWrapper: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    marginBottom: theme.spacing.s2,
  },
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
  },
  avatarFallback: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    backgroundColor: `${colors.primary}18`,
    borderWidth: 2,
    borderColor: `${colors.primary}30`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.primary,
  },
  uploadOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: AVATAR_SIZE / 2,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary,
    borderWidth: 2,
    borderColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.textStrong,
    textAlign: 'center',
    paddingHorizontal: theme.spacing.s8,
  },
  hint: {
    fontSize: 12,
    color: theme.colors.textMuted,
  },
})

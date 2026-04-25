import { Modal, Pressable, StyleSheet, Text, View } from 'react-native'
import { Image } from 'expo-image'
import { Feather } from '@expo/vector-icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { getInitials } from '@/lib/formatters'
import { colors } from '@/theme/colors'
import theme from '@/theme/theme'

export type UserMenuAction = {
  label: string
  icon?: keyof typeof Feather.glyphMap
  danger?: boolean
  disabled?: boolean
  onPress: () => void
}

type Props = {
  visible: boolean
  onClose: () => void
  userName?: string | null
  avatarUrl?: string | null
  userRole?: string | null
  actions: UserMenuAction[]
}

const AVATAR_SIZE = 48

function getRoleLabel(role?: string | null): string {
  if (role === 'creator') return 'Criador de conteúdo'
  if (role === 'business') return 'Empresa'
  return ''
}

export function UserMenuBottomSheet({ visible, onClose, userName, avatarUrl, userRole, actions }: Props) {
  const insets = useSafeAreaInsets()
  const initials = userName?.trim() ? getInitials(userName.trim()) : null

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable
          style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 16) }]}
          onPress={() => {}}
        >
          <View style={styles.handleWrapper}>
            <View style={styles.handle} />
          </View>

          <View style={styles.identityBlock}>
            <View style={styles.avatar}>
              {avatarUrl ? (
                <Image source={{ uri: avatarUrl }} style={styles.avatarImage} contentFit="cover" />
              ) : initials ? (
                <Text style={styles.avatarInitials}>{initials}</Text>
              ) : (
                <View style={styles.avatarNeutral} />
              )}
            </View>
            <View style={styles.identityText}>
              <Text style={styles.userName} numberOfLines={1}>
                {userName ?? '—'}
              </Text>
              {userRole ? <Text style={styles.userRoleLabel}>{getRoleLabel(userRole)}</Text> : null}
            </View>
          </View>

          <View>
            {actions.map((action, index) => {
              const isDangerSeparator =
                action.danger && index > 0 && !actions[index - 1]?.danger
              return (
                <Pressable
                  key={action.label}
                  onPress={action.disabled ? undefined : action.onPress}
                  disabled={action.disabled}
                  accessibilityRole="button"
                  accessibilityLabel={action.label}
                  style={({ pressed }) => [
                    styles.actionItem,
                    index < actions.length - 1 && styles.actionItemBorderBottom,
                    isDangerSeparator && styles.actionItemDangerSeparator,
                    pressed && !action.disabled && styles.actionItemPressed,
                    action.disabled && styles.actionItemDisabled,
                  ]}
                >
                  {action.icon ? (
                    <Feather
                      name={action.icon}
                      size={20}
                      color={
                        action.disabled
                          ? theme.colors.disabledText
                          : action.danger
                            ? colors.error
                            : theme.colors.textSecondary
                      }
                      style={styles.actionIcon}
                    />
                  ) : null}
                  <Text
                    style={[
                      styles.actionLabel,
                      action.danger && styles.actionLabelDanger,
                      action.disabled && styles.actionLabelDisabled,
                    ]}
                  >
                    {action.label}
                  </Text>
                </Pressable>
              )
            })}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: theme.borderRadii.card,
    borderTopRightRadius: theme.borderRadii.card,
  },
  handleWrapper: {
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 4,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.colors.borderSubtle,
  },
  identityBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.s3,
    paddingHorizontal: theme.spacing.s5,
    paddingVertical: theme.spacing.s4,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.border,
  },
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    borderWidth: 2,
    borderColor: colors.primary,
    backgroundColor: theme.colors.primarySurface,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    flexShrink: 0,
  },
  avatarImage: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
  },
  avatarInitials: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.primary,
  },
  avatarNeutral: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: theme.colors.primarySurfaceAlt,
  },
  identityText: {
    flex: 1,
    minWidth: 0,
  },
  userName: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.textStrong,
  },
  userRoleLabel: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.s5,
    paddingVertical: theme.spacing.s4,
    minHeight: 52,
  },
  actionItemBorderBottom: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.border,
  },
  actionItemDangerSeparator: {
    marginTop: theme.spacing.s2,
  },
  actionItemPressed: {
    backgroundColor: theme.colors.backgroundAlt,
  },
  actionItemDisabled: {
    opacity: 0.45,
  },
  actionIcon: {
    marginRight: theme.spacing.s3,
  },
  actionLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: theme.colors.text,
    flex: 1,
  },
  actionLabelDanger: {
    color: colors.error,
  },
  actionLabelDisabled: {
    color: theme.colors.disabledText,
  },
})

import { StyleSheet, Text, TextInput, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import theme from '@/theme/theme'
import { colors } from '@/theme/colors'

type Props = {
  instagram: string
  onInstagramChange: (v: string) => void
  tiktok: string
  onTiktokChange: (v: string) => void
}

export function ProfileSocialsSection({ instagram, onInstagramChange, tiktok, onTiktokChange }: Props) {
  return (
    <View style={styles.card}>
      <Text style={styles.sectionTitle}>Redes sociais</Text>

      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Instagram</Text>
        <View style={styles.inputRow}>
          <View style={styles.iconWrapper}>
            <Ionicons name="logo-instagram" size={16} color={colors.primary} />
          </View>
          <TextInput
            style={styles.input}
            value={instagram}
            onChangeText={onInstagramChange}
            placeholder="seuperfil"
            placeholderTextColor={theme.colors.textMuted}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="next"
          />
        </View>
      </View>

      <View style={styles.fieldGroup}>
        <Text style={styles.label}>TikTok</Text>
        <View style={styles.inputRow}>
          <View style={styles.iconWrapper}>
            <Ionicons name="logo-tiktok" size={15} color={colors.primary} />
          </View>
          <TextInput
            style={styles.input}
            value={tiktok}
            onChangeText={onTiktokChange}
            placeholder="seuperfil"
            placeholderTextColor={theme.colors.textMuted}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="done"
          />
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadii.card,
    padding: theme.spacing.s5,
    gap: theme.spacing.s4,
    shadowColor: '#1f2937',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.textStrong,
    letterSpacing: 0.2,
  },
  fieldGroup: {
    gap: 6,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    letterSpacing: 0.3,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceAlt,
    borderRadius: theme.borderRadii.lg,
    overflow: 'hidden',
  },
  iconWrapper: {
    paddingHorizontal: theme.spacing.s3,
    paddingVertical: theme.spacing.s3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    flex: 1,
    paddingVertical: theme.spacing.s3,
    paddingRight: theme.spacing.s4,
    fontSize: 15,
    color: theme.colors.text,
  },
})

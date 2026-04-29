import { StyleSheet, Text, TextInput, View } from 'react-native'
import theme from '@/theme/theme'

type Props = {
  name: string
  onNameChange: (v: string) => void
  bio: string
  onBioChange: (v: string) => void
  phone: string
  onPhoneChange: (v: string) => void
}

export function ProfileFormSection({ name, onNameChange, bio, onBioChange, phone, onPhoneChange }: Props) {
  return (
    <View style={styles.card}>
      <Text style={styles.sectionTitle}>Informações básicas</Text>

      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Nome</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={onNameChange}
          placeholder="Seu nome completo"
          placeholderTextColor={theme.colors.textMuted}
          autoCapitalize="words"
          autoCorrect={false}
          returnKeyType="next"
        />
      </View>

      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Bio</Text>
        <TextInput
          style={[styles.input, styles.inputMultiline]}
          value={bio}
          onChangeText={onBioChange}
          placeholder="Fale um pouco sobre você e seu trabalho..."
          placeholderTextColor={theme.colors.textMuted}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
          returnKeyType="default"
        />
      </View>

      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Telefone</Text>
        <TextInput
          style={styles.input}
          value={phone}
          onChangeText={onPhoneChange}
          placeholder="(11) 99999-9999"
          placeholderTextColor={theme.colors.textMuted}
          keyboardType="phone-pad"
          returnKeyType="done"
        />
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
  input: {
    backgroundColor: theme.colors.surfaceAlt,
    borderRadius: theme.borderRadii.lg,
    paddingHorizontal: theme.spacing.s4,
    paddingVertical: theme.spacing.s3,
    fontSize: 15,
    color: theme.colors.text,
  },
  inputMultiline: {
    minHeight: 96,
    paddingTop: theme.spacing.s3,
  },
})

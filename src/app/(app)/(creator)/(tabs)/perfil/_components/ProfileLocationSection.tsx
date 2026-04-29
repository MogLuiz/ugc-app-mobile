import { StyleSheet, Text, TextInput, View } from 'react-native'
import theme from '@/theme/theme'

type Props = {
  city: string
  onCityChange: (v: string) => void
  state: string
  onStateChange: (v: string) => void
}

export function ProfileLocationSection({ city, onCityChange, state, onStateChange }: Props) {
  return (
    <View style={styles.card}>
      <Text style={styles.sectionTitle}>Localização</Text>

      <View style={styles.row}>
        <View style={styles.cityField}>
          <Text style={styles.label}>Cidade</Text>
          <TextInput
            style={styles.input}
            value={city}
            onChangeText={onCityChange}
            placeholder="São Paulo"
            placeholderTextColor={theme.colors.textMuted}
            autoCapitalize="words"
            autoCorrect={false}
            returnKeyType="next"
          />
        </View>

        <View style={styles.stateField}>
          <Text style={styles.label}>Estado</Text>
          <TextInput
            style={styles.input}
            value={state}
            onChangeText={onStateChange}
            placeholder="SP"
            placeholderTextColor={theme.colors.textMuted}
            autoCapitalize="characters"
            autoCorrect={false}
            maxLength={2}
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
  row: {
    flexDirection: 'row',
    gap: theme.spacing.s3,
  },
  cityField: {
    flex: 3,
    gap: 6,
  },
  stateField: {
    flex: 1,
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
})

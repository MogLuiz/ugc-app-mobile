import { useCallback, useEffect, useRef, useState } from 'react'
import { ActivityIndicator, StyleSheet, Text, TextInput, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import theme from '@/theme/theme'
import { colors } from '@/theme/colors'
import { lookupCep, formatCep } from '@/modules/creator-profile-edit/cep-lookup'

type CepStatus = 'idle' | 'loading' | 'found' | 'not_found' | 'error'

type Props = {
  zipCode: string
  onZipCodeChange: (v: string) => void
  street: string
  onStreetChange: (v: string) => void
  number: string
  onNumberChange: (v: string) => void
  city: string
  onCityChange: (v: string) => void
  state: string
  onStateChange: (v: string) => void
}

export function ProfileAddressSection({
  zipCode,
  onZipCodeChange,
  street,
  onStreetChange,
  number,
  onNumberChange,
  city,
  onCityChange,
  state,
  onStateChange,
}: Props) {
  const [cepStatus, setCepStatus] = useState<CepStatus>('idle')
  const [lockedByZip, setLockedByZip] = useState(
    () => !!(city && state && zipCode),
  )
  const abortRef = useRef<AbortController | null>(null)

  // Re-evaluate lock when initial data loads from server
  useEffect(() => {
    if (city && state && zipCode) setLockedByZip(true)
  }, [city, state, zipCode])

  const handleCepChange = useCallback(
    async (raw: string) => {
      const masked = formatCep(raw)
      onZipCodeChange(masked)

      const digits = masked.replace(/\D/g, '')

      if (digits.length < 8) {
        abortRef.current?.abort()
        abortRef.current = null
        setLockedByZip(false)
        setCepStatus('idle')
        return
      }

      abortRef.current?.abort()
      const controller = new AbortController()
      abortRef.current = controller

      setCepStatus('loading')
      try {
        const result = await lookupCep(digits, controller.signal)

        if (result.found) {
          onCityChange(result.city)
          onStateChange(result.state)
          if (result.street) onStreetChange(result.street)
          setLockedByZip(true)
          setCepStatus('found')
        } else {
          setLockedByZip(false)
          setCepStatus('not_found')
        }
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') return
        setLockedByZip(false)
        setCepStatus('error')
      }
    },
    [onZipCodeChange, onCityChange, onStateChange, onStreetChange],
  )

  return (
    <View style={styles.card}>
      <Text style={styles.sectionTitle}>Endereço</Text>

      {/* CEP */}
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>CEP</Text>
        <View style={styles.cepRow}>
          <TextInput
            style={[styles.input, styles.inputFlex]}
            value={zipCode}
            onChangeText={(v) => void handleCepChange(v)}
            placeholder="00000-000"
            placeholderTextColor={theme.colors.textMuted}
            keyboardType="numeric"
            maxLength={9}
            returnKeyType="next"
          />
          <View style={styles.cepStatus}>
            {cepStatus === 'loading' ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : cepStatus === 'found' ? (
              <Ionicons name="checkmark-circle" size={20} color={theme.colors.success} />
            ) : cepStatus === 'not_found' || cepStatus === 'error' ? (
              <Ionicons name="close-circle" size={20} color={theme.colors.error} />
            ) : null}
          </View>
        </View>
        {cepStatus === 'idle' && !zipCode ? (
          <Text style={styles.hint}>Digite o CEP para preencher automaticamente</Text>
        ) : cepStatus === 'not_found' ? (
          <Text style={[styles.hint, styles.hintError]}>
            CEP não encontrado. Preencha o endereço manualmente.
          </Text>
        ) : cepStatus === 'error' ? (
          <Text style={[styles.hint, styles.hintError]}>
            Não foi possível validar o CEP. Preencha manualmente.
          </Text>
        ) : null}
      </View>

      {/* Street */}
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Rua</Text>
        <TextInput
          style={styles.input}
          value={street}
          onChangeText={onStreetChange}
          placeholder="Logradouro"
          placeholderTextColor={theme.colors.textMuted}
          autoCapitalize="words"
          autoCorrect={false}
          returnKeyType="next"
        />
      </View>

      {/* Number */}
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Número</Text>
        <TextInput
          style={[styles.input, styles.inputShort]}
          value={number}
          onChangeText={onNumberChange}
          placeholder="Nº"
          placeholderTextColor={theme.colors.textMuted}
          keyboardType="default"
          returnKeyType="next"
        />
      </View>

      {/* City + State */}
      <View style={styles.row}>
        <View style={styles.cityField}>
          <Text style={styles.label}>Cidade</Text>
          <TextInput
            style={[styles.input, lockedByZip && styles.inputLocked]}
            value={city}
            onChangeText={onCityChange}
            placeholder="Cidade"
            placeholderTextColor={theme.colors.textMuted}
            autoCapitalize="words"
            autoCorrect={false}
            editable={!lockedByZip}
            returnKeyType="next"
          />
        </View>

        <View style={styles.stateField}>
          <Text style={styles.label}>Estado</Text>
          <TextInput
            style={[styles.input, lockedByZip && styles.inputLocked]}
            value={state}
            onChangeText={onStateChange}
            placeholder="UF"
            placeholderTextColor={theme.colors.textMuted}
            autoCapitalize="characters"
            autoCorrect={false}
            maxLength={2}
            editable={!lockedByZip}
            returnKeyType="done"
          />
        </View>
      </View>

      {lockedByZip ? (
        <Text style={styles.lockedHint}>
          Cidade e estado são definidos pelo CEP. Para alterar, mude o CEP.
        </Text>
      ) : null}
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
  inputFlex: {
    flex: 1,
  },
  inputShort: {
    alignSelf: 'flex-start',
    minWidth: 100,
  },
  inputLocked: {
    color: theme.colors.textMuted,
    opacity: 0.8,
  },
  cepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.s3,
  },
  cepStatus: {
    width: 24,
    alignItems: 'center',
    justifyContent: 'center',
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
  hint: {
    fontSize: 11,
    color: theme.colors.textMuted,
    lineHeight: 16,
  },
  hintError: {
    color: theme.colors.error,
  },
  lockedHint: {
    fontSize: 11,
    color: theme.colors.textMuted,
    lineHeight: 15,
  },
})

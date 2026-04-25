import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRef, useState } from 'react'
import { router } from 'expo-router'
import { Feather, Ionicons } from '@expo/vector-icons'
import { authService, getFriendlyAuthError } from '@/services/auth.service'
import { colors } from '@/theme/colors'
import theme from '@/theme/theme'

type Fields = {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

type Errors = {
  currentPassword?: string
  newPassword?: string
  confirmPassword?: string
  form?: string
}

function validate(fields: Fields): Errors {
  const errs: Errors = {}
  if (!fields.currentPassword) {
    errs.currentPassword = 'Informe a senha atual.'
  }
  if (!fields.newPassword) {
    errs.newPassword = 'Informe a nova senha.'
  } else if (fields.newPassword.length < 8) {
    errs.newPassword = 'Mínimo de 8 caracteres.'
  } else if (fields.newPassword === fields.currentPassword) {
    errs.newPassword = 'A nova senha deve ser diferente da senha atual.'
  }
  if (!fields.confirmPassword) {
    errs.confirmPassword = 'Confirme a nova senha.'
  } else if (fields.confirmPassword !== fields.newPassword) {
    errs.confirmPassword = 'As senhas não conferem.'
  }
  return errs
}

export default function ConfiguracoesScreen() {
  const newPasswordRef = useRef<TextInput>(null)
  const confirmPasswordRef = useRef<TextInput>(null)

  const [fields, setFields] = useState<Fields>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [errors, setErrors] = useState<Errors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  function setField(key: keyof Fields, value: string) {
    setFields((prev) => ({ ...prev, [key]: value }))
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }))
    if (success) setSuccess(false)
  }

  async function handleSubmit() {
    if (isSubmitting) return

    const validationErrors = validate(fields)
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    setErrors({})
    setSuccess(false)
    setIsSubmitting(true)

    try {
      await authService.changePassword(fields.currentPassword, fields.newPassword)
      setFields({ currentPassword: '', newPassword: '', confirmPassword: '' })
      setSuccess(true)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : undefined
      if (message === 'Senha atual incorreta') {
        setErrors({ currentPassword: 'Senha atual incorreta.' })
      } else {
        setErrors({ form: getFriendlyAuthError(message) })
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <Pressable
              onPress={() => router.back()}
              style={styles.backButton}
              accessibilityRole="button"
              accessibilityLabel="Voltar"
              hitSlop={8}
            >
              <Ionicons name="chevron-back" size={24} color={theme.colors.textStrong} />
            </Pressable>
            <Text style={styles.headerTitle}>Configurações</Text>
            <View style={styles.headerSpacer} />
          </View>

          {/* Erro global */}
          {errors.form ? (
            <View style={styles.bannerError}>
              <Text style={styles.bannerErrorText}>{errors.form}</Text>
            </View>
          ) : null}

          {/* Sucesso */}
          {success ? (
            <View style={styles.bannerSuccess}>
              <Feather name="check-circle" size={16} color={theme.colors.success} style={styles.bannerIcon} />
              <Text style={styles.bannerSuccessText}>Senha alterada com sucesso!</Text>
            </View>
          ) : null}

          {/* Card segurança */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.cardIconWrap}>
                <Feather name="lock" size={18} color={colors.primary} />
              </View>
              <View style={styles.cardHeaderText}>
                <Text style={styles.cardTitle}>Alterar senha</Text>
                <Text style={styles.cardSubtitle}>
                  Troque sua senha regularmente para manter sua conta protegida.
                </Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.cardBody}>
              {/* Senha atual */}
              <View style={styles.fieldWrap}>
                <Text style={styles.label}>SENHA ATUAL</Text>
                <View style={[styles.inputRow, errors.currentPassword ? styles.inputRowError : undefined]}>
                  <Feather name="lock" size={15} color={theme.colors.textMuted} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Sua senha atual"
                    placeholderTextColor={theme.colors.textMuted}
                    secureTextEntry={!showCurrent}
                    autoCapitalize="none"
                    autoCorrect={false}
                    textContentType="password"
                    returnKeyType="next"
                    value={fields.currentPassword}
                    onChangeText={(v) => setField('currentPassword', v)}
                    onSubmitEditing={() => newPasswordRef.current?.focus()}
                    editable={!isSubmitting}
                  />
                  <Pressable
                    onPress={() => setShowCurrent((v) => !v)}
                    style={styles.eyeButton}
                    accessibilityLabel={showCurrent ? 'Ocultar senha' : 'Mostrar senha'}
                    hitSlop={4}
                  >
                    <Feather
                      name={showCurrent ? 'eye-off' : 'eye'}
                      size={18}
                      color={theme.colors.textMuted}
                    />
                  </Pressable>
                </View>
                {errors.currentPassword ? (
                  <Text style={styles.fieldError}>{errors.currentPassword}</Text>
                ) : null}
              </View>

              {/* Nova senha */}
              <View style={styles.fieldWrap}>
                <Text style={styles.label}>NOVA SENHA</Text>
                <View style={[styles.inputRow, errors.newPassword ? styles.inputRowError : undefined]}>
                  <Feather name="lock" size={15} color={theme.colors.textMuted} style={styles.inputIcon} />
                  <TextInput
                    ref={newPasswordRef}
                    style={styles.input}
                    placeholder="Mínimo 8 caracteres"
                    placeholderTextColor={theme.colors.textMuted}
                    secureTextEntry={!showNew}
                    autoCapitalize="none"
                    autoCorrect={false}
                    textContentType="newPassword"
                    returnKeyType="next"
                    value={fields.newPassword}
                    onChangeText={(v) => setField('newPassword', v)}
                    onSubmitEditing={() => confirmPasswordRef.current?.focus()}
                    editable={!isSubmitting}
                  />
                  <Pressable
                    onPress={() => setShowNew((v) => !v)}
                    style={styles.eyeButton}
                    accessibilityLabel={showNew ? 'Ocultar senha' : 'Mostrar senha'}
                    hitSlop={4}
                  >
                    <Feather
                      name={showNew ? 'eye-off' : 'eye'}
                      size={18}
                      color={theme.colors.textMuted}
                    />
                  </Pressable>
                </View>
                {errors.newPassword ? (
                  <Text style={styles.fieldError}>{errors.newPassword}</Text>
                ) : null}
              </View>

              {/* Confirmar nova senha */}
              <View style={styles.fieldWrap}>
                <Text style={styles.label}>CONFIRMAR NOVA SENHA</Text>
                <View style={[styles.inputRow, errors.confirmPassword ? styles.inputRowError : undefined]}>
                  <Feather name="lock" size={15} color={theme.colors.textMuted} style={styles.inputIcon} />
                  <TextInput
                    ref={confirmPasswordRef}
                    style={styles.input}
                    placeholder="Repita a nova senha"
                    placeholderTextColor={theme.colors.textMuted}
                    secureTextEntry={!showConfirm}
                    autoCapitalize="none"
                    autoCorrect={false}
                    textContentType="newPassword"
                    returnKeyType="done"
                    value={fields.confirmPassword}
                    onChangeText={(v) => setField('confirmPassword', v)}
                    onSubmitEditing={handleSubmit}
                    editable={!isSubmitting}
                  />
                  <Pressable
                    onPress={() => setShowConfirm((v) => !v)}
                    style={styles.eyeButton}
                    accessibilityLabel={showConfirm ? 'Ocultar senha' : 'Mostrar senha'}
                    hitSlop={4}
                  >
                    <Feather
                      name={showConfirm ? 'eye-off' : 'eye'}
                      size={18}
                      color={theme.colors.textMuted}
                    />
                  </Pressable>
                </View>
                {errors.confirmPassword ? (
                  <Text style={styles.fieldError}>{errors.confirmPassword}</Text>
                ) : null}
              </View>

              {/* Botão submit */}
              <Pressable
                onPress={handleSubmit}
                disabled={isSubmitting}
                style={({ pressed }) => [
                  styles.submitButton,
                  pressed && !isSubmitting && styles.submitButtonPressed,
                  isSubmitting && styles.submitButtonDisabled,
                ]}
                accessibilityRole="button"
                accessibilityLabel="Salvar nova senha"
              >
                {isSubmitting ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.submitButtonText}>Salvar nova senha</Text>
                )}
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background.light,
  },
  flex: {
    flex: 1,
  },
  scroll: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 40,
    gap: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    marginBottom: 4,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 17,
    fontWeight: '700',
    color: theme.colors.textStrong,
  },
  headerSpacer: {
    width: 40,
  },
  bannerError: {
    backgroundColor: theme.colors.errorSurface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.errorBorder,
    borderRadius: theme.borderRadii.lg,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  bannerErrorText: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.error,
  },
  bannerSuccess: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0fdf4',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#bbf7d0',
    borderRadius: theme.borderRadii.lg,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  bannerIcon: {
    flexShrink: 0,
  },
  bannerSuccessText: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.success,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadii.card,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
    overflow: 'hidden',
    ...theme.shadows.cardNeutral,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 20,
  },
  cardIconWrap: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadii.lg,
    backgroundColor: theme.colors.primarySurface,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  cardHeaderText: {
    flex: 1,
    minWidth: 0,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.textStrong,
  },
  cardSubtitle: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginTop: 2,
    lineHeight: 18,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: theme.colors.border,
  },
  cardBody: {
    padding: 20,
    gap: 16,
  },
  fieldWrap: {
    gap: 6,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.textMuted,
    letterSpacing: 0.8,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    borderRadius: theme.borderRadii.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.inputBackground,
    paddingHorizontal: 12,
  },
  inputRowError: {
    borderColor: theme.colors.error,
  },
  inputIcon: {
    marginRight: 8,
    flexShrink: 0,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: theme.colors.textStrong,
    paddingVertical: 0,
  },
  eyeButton: {
    padding: 8,
    marginRight: -8,
    flexShrink: 0,
  },
  fieldError: {
    fontSize: 12,
    fontWeight: '500',
    color: theme.colors.error,
    marginTop: 2,
  },
  submitButton: {
    height: 50,
    borderRadius: theme.borderRadii.lg,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
    ...theme.shadows.primary,
  },
  submitButtonPressed: {
    backgroundColor: theme.colors.primaryPressed,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },
})

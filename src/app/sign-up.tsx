import { UgcLogo } from '@/components/UgcLogo'
import { getFriendlyRegisterError } from '@/services/auth.service'
import { colors } from '@/theme/colors'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import { useRef, useState } from 'react'
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
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useSession } from '@/hooks/useSession'

type Role = 'business' | 'creator'

type FormErrors = {
  name?: string
  email?: string
  password?: string
  confirmPassword?: string
  acceptTerms?: string
  form?: string
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const ROLE_OPTIONS: { value: Role; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { value: 'business', label: 'Sou empresa', icon: 'business-outline' },
  { value: 'creator', label: 'Sou criador', icon: 'videocam-outline' },
]

const ROLE_COPY: Record<Role, string> = {
  business: 'Contrate criadores para o seu negócio',
  creator: 'Receba oportunidades e monetize seu conteúdo',
}

function extractErrorMessage(err: unknown): string | undefined {
  if (!err || typeof err !== 'object') return undefined
  const e = err as Record<string, unknown>
  if (typeof e.message === 'string') return e.message
  return undefined
}

export default function SignUpScreen() {
  const { signUp } = useSession()
  const insets = useSafeAreaInsets()

  const [role, setRole] = useState<Role | null>(null)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [confirmationSent, setConfirmationSent] = useState(false)

  const emailRef = useRef<TextInput>(null)
  const passwordRef = useRef<TextInput>(null)
  const confirmPasswordRef = useRef<TextInput>(null)

  function validate(): FormErrors {
    const next: FormErrors = {}
    if (!name.trim() || name.trim().length < 2) next.name = 'Informe seu nome completo.'
    if (!email.trim()) {
      next.email = 'E-mail é obrigatório.'
    } else if (!EMAIL_REGEX.test(email.trim())) {
      next.email = 'Informe um e-mail válido.'
    }
    if (!password) {
      next.password = 'Senha é obrigatória.'
    } else if (password.length < 8) {
      next.password = 'A senha deve ter pelo menos 8 caracteres.'
    }
    if (!confirmPassword) {
      next.confirmPassword = 'Confirme sua senha.'
    } else if (confirmPassword !== password) {
      next.confirmPassword = 'As senhas não coincidem.'
    }
    if (!acceptTerms) next.acceptTerms = 'Você precisa aceitar os termos para continuar.'
    return next
  }

  async function handleSubmit() {
    if (isSubmitting || !role) return

    const validationErrors = validate()
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    setErrors({})
    setIsSubmitting(true)
    try {
      const kind = await signUp(email.trim(), password, {
        name: name.trim(),
        role: role === 'business' ? 'COMPANY' : 'CREATOR',
      })

      if (kind === 'success') {
        router.replace('/(app)/(tabs)')
      } else {
        setConfirmationSent(true)
      }
    } catch (err: unknown) {
      const raw = extractErrorMessage(err)
      setErrors({ form: getFriendlyRegisterError(raw) })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (confirmationSent) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.confirmationWrap}>
          <View style={styles.confirmationIcon}>
            <Ionicons name="mail-outline" size={36} color={colors.primary} />
          </View>
          <Text style={styles.confirmationTitle}>Verifique seu e-mail</Text>
          <Text style={styles.confirmationText}>
            Enviamos um link de ativação para{' '}
            <Text style={styles.confirmationEmail}>{email}</Text>. Abra o e-mail e clique no
            link para ativar sua conta.
          </Text>
          <Pressable style={styles.confirmationButton} onPress={() => router.replace('/sign-in')}>
            <Text style={styles.confirmationButtonText}>Ir para o login</Text>
          </Pressable>
        </View>
      </View>
    )
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={[styles.inner, { paddingTop: insets.top + 12 }]}
        keyboardShouldPersistTaps="handled"
        bounces={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable
            style={styles.backButton}
            onPress={() => router.back()}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="chevron-back" size={22} color="#0f172a" />
          </Pressable>
          <View style={styles.logoRow}>
            <UgcLogo size={36} />
            <Text style={styles.logoText}>UGC Local</Text>
          </View>
          <View style={styles.headerSpacer} />
        </View>

        {/* Heading */}
        <View style={styles.headingBlock}>
          <Text style={styles.heading}>Crie sua conta</Text>
          <Text style={styles.subheading}>Escolha como deseja usar a plataforma</Text>
        </View>

        {/* Step 1 */}
        <Text style={styles.stepLabelPurple}>PASSO 1 · ESCOLHA SEU PERFIL</Text>
        <View style={styles.roleCards}>
          {ROLE_OPTIONS.map(({ value, label, icon }) => {
            const selected = role === value
            return (
              <Pressable
                key={value}
                style={[styles.roleCard, selected && styles.roleCardSelected]}
                onPress={() => setRole(value)}
              >
                <View style={[styles.roleCardIcon, selected && styles.roleCardIconSelected]}>
                  <Ionicons
                    name={icon}
                    size={20}
                    color={selected ? '#6d28d9' : '#64748b'}
                  />
                </View>
                <Text style={styles.roleCardLabel}>{label}</Text>
                {selected ? (
                  <Ionicons
                    name="checkmark-circle"
                    size={22}
                    color={colors.primary}
                    style={styles.roleCardCheck}
                  />
                ) : null}
              </Pressable>
            )
          })}
        </View>
        {role ? (
          <Text style={styles.roleCopy}>{ROLE_COPY[role]}</Text>
        ) : (
          <Text style={styles.roleCopyMuted}>Selecione uma opção acima para liberar o cadastro</Text>
        )}

        {/* Divider + Step 2 */}
        <View style={styles.divider} />
        <Text style={styles.stepLabelSlate}>PASSO 2 · SEUS DADOS</Text>

        {/* Name */}
        <View style={styles.fieldWrap}>
          <Text style={styles.label}>NOME COMPLETO</Text>
          <View style={[styles.inputRow, errors.name ? styles.inputRowError : undefined]}>
            <Ionicons name="person-outline" size={16} color="#94a3b8" style={styles.inputIcon} />
            <TextInput
              style={styles.inputText}
              placeholder="Como quer ser chamado?"
              placeholderTextColor="#94a3b8"
              autoCapitalize="words"
              autoCorrect={false}
              returnKeyType="next"
              value={name}
              onChangeText={(v) => {
                setName(v)
                if (errors.name) setErrors((p) => ({ ...p, name: undefined }))
              }}
              onSubmitEditing={() => emailRef.current?.focus()}
              editable={!isSubmitting}
            />
          </View>
          {errors.name ? <Text style={styles.fieldError}>{errors.name}</Text> : null}
        </View>

        {/* Email */}
        <View style={styles.fieldWrap}>
          <Text style={styles.label}>E-MAIL</Text>
          <View style={[styles.inputRow, errors.email ? styles.inputRowError : undefined]}>
            <Ionicons name="mail-outline" size={16} color="#94a3b8" style={styles.inputIcon} />
            <TextInput
              ref={emailRef}
              style={styles.inputText}
              placeholder="seu@email.com"
              placeholderTextColor="#94a3b8"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="next"
              value={email}
              onChangeText={(v) => {
                setEmail(v)
                if (errors.email) setErrors((p) => ({ ...p, email: undefined }))
              }}
              onSubmitEditing={() => passwordRef.current?.focus()}
              editable={!isSubmitting}
            />
          </View>
          {errors.email ? <Text style={styles.fieldError}>{errors.email}</Text> : null}
        </View>

        {/* Password */}
        <View style={styles.fieldWrap}>
          <Text style={styles.label}>SENHA</Text>
          <View style={[styles.inputRow, errors.password ? styles.inputRowError : undefined]}>
            <Ionicons name="lock-closed-outline" size={16} color="#94a3b8" style={styles.inputIcon} />
            <TextInput
              ref={passwordRef}
              style={styles.inputText}
              placeholder="Mínimo 8 caracteres"
              placeholderTextColor="#94a3b8"
              secureTextEntry={!showPassword}
              returnKeyType="next"
              value={password}
              onChangeText={(v) => {
                setPassword(v)
                if (errors.password) setErrors((p) => ({ ...p, password: undefined }))
              }}
              onSubmitEditing={() => confirmPasswordRef.current?.focus()}
              editable={!isSubmitting}
            />
            <Pressable
              onPress={() => setShowPassword((v) => !v)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons
                name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                size={18}
                color="#94a3b8"
              />
            </Pressable>
          </View>
          {errors.password ? <Text style={styles.fieldError}>{errors.password}</Text> : null}
        </View>

        {/* Confirm Password */}
        <View style={styles.fieldWrap}>
          <Text style={styles.label}>CONFIRMAR SENHA</Text>
          <View style={[styles.inputRow, errors.confirmPassword ? styles.inputRowError : undefined]}>
            <Ionicons name="lock-closed-outline" size={16} color="#94a3b8" style={styles.inputIcon} />
            <TextInput
              ref={confirmPasswordRef}
              style={styles.inputText}
              placeholder="Confirme sua senha"
              placeholderTextColor="#94a3b8"
              secureTextEntry={!showConfirmPassword}
              returnKeyType="done"
              value={confirmPassword}
              onChangeText={(v) => {
                setConfirmPassword(v)
                if (errors.confirmPassword) setErrors((p) => ({ ...p, confirmPassword: undefined }))
              }}
              onSubmitEditing={handleSubmit}
              editable={!isSubmitting}
            />
            <Pressable
              onPress={() => setShowConfirmPassword((v) => !v)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons
                name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                size={18}
                color="#94a3b8"
              />
            </Pressable>
          </View>
          {errors.confirmPassword ? (
            <Text style={styles.fieldError}>{errors.confirmPassword}</Text>
          ) : null}
        </View>

        {/* Terms */}
        <Pressable
          style={styles.termsRow}
          onPress={() => {
            setAcceptTerms((v) => !v)
            if (errors.acceptTerms) setErrors((p) => ({ ...p, acceptTerms: undefined }))
          }}
        >
          <View style={[styles.checkbox, acceptTerms && styles.checkboxChecked]}>
            {acceptTerms ? <Ionicons name="checkmark" size={11} color="#fff" /> : null}
          </View>
          <Text style={styles.termsText}>
            Eu aceito os{' '}
            <Text style={styles.termsLink}>Termos e Condições</Text>
            {' '}e a{' '}
            <Text style={styles.termsLink}>Política de Privacidade</Text>
            <Text style={styles.termsTextMuted}> do UGC Local.</Text>
          </Text>
        </Pressable>
        {errors.acceptTerms ? (
          <Text style={[styles.fieldError, { marginTop: -8, marginBottom: 4 }]}>
            {errors.acceptTerms}
          </Text>
        ) : null}

        {/* Form error */}
        {errors.form ? (
          <View style={styles.formErrorBox}>
            <Text style={styles.formErrorText}>{errors.form}</Text>
          </View>
        ) : null}

        {/* Submit */}
        <Pressable
          style={({ pressed }) => [
            styles.button,
            (!role || isSubmitting) && styles.buttonDisabled,
            pressed && role && !isSubmitting && styles.buttonPressed,
          ]}
          onPress={handleSubmit}
          disabled={!role || isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>
              {!role
                ? 'Escolha seu perfil para continuar'
                : role === 'business'
                  ? 'Criar conta como Empresa'
                  : 'Criar conta como Criador'}
            </Text>
          )}
        </Pressable>

        {/* Login link */}
        <View style={styles.loginRow}>
          <Text style={styles.loginText}>Já possui conta? </Text>
          <Pressable onPress={() => router.back()}>
            <Text style={styles.loginLink}>Faça login</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  inner: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 48,
  },
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  logoText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0f172a',
    letterSpacing: -0.4,
  },
  headerSpacer: {
    width: 36,
  },
  // Heading
  headingBlock: {
    alignItems: 'center',
    marginBottom: 24,
    gap: 6,
  },
  heading: {
    fontSize: 26,
    fontWeight: '900',
    color: '#0f172a',
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  subheading: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
  },
  // Step labels
  stepLabelPurple: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
    letterSpacing: 0.9,
    textAlign: 'center',
    marginBottom: 12,
  },
  stepLabelSlate: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94a3b8',
    letterSpacing: 0.9,
    marginBottom: 16,
  },
  // Role cards
  roleCards: {
    gap: 10,
    marginBottom: 10,
  },
  roleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    borderRadius: 14,
    borderCurve: 'continuous',
    paddingHorizontal: 14,
    paddingVertical: 14,
    backgroundColor: '#fff',
  },
  roleCardSelected: {
    borderColor: colors.primary,
    backgroundColor: '#f3edff',
    boxShadow: '0 4px 16px -4px rgba(137, 90, 246, 0.25)',
  },
  roleCardIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    borderCurve: 'continuous',
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  roleCardIconSelected: {
    backgroundColor: '#e4d7ff',
  },
  roleCardLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a',
  },
  roleCardCheck: {
    marginLeft: 4,
  },
  roleCopy: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.primary,
    textAlign: 'center',
    marginBottom: 4,
  },
  roleCopyMuted: {
    fontSize: 12,
    color: '#94a3b8',
    textAlign: 'center',
    marginBottom: 4,
  },
  // Divider
  divider: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginVertical: 20,
  },
  // Fields
  fieldWrap: {
    marginBottom: 14,
    gap: 6,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94a3b8',
    letterSpacing: 0.8,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    borderCurve: 'continuous',
    paddingHorizontal: 12,
    height: 50,
  },
  inputRowError: {
    borderColor: '#f87171',
  },
  inputIcon: {
    marginRight: 8,
  },
  inputText: {
    flex: 1,
    fontSize: 15,
    color: '#0f172a',
    paddingVertical: 0,
  },
  fieldError: {
    fontSize: 12,
    color: '#ef4444',
    marginTop: 2,
  },
  // Terms
  termsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 16,
    marginTop: 4,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: '#cbd5e1',
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
    flexShrink: 0,
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  termsText: {
    flex: 1,
    fontSize: 13,
    color: '#475569',
    lineHeight: 18,
  },
  termsLink: {
    color: colors.primary,
    fontWeight: '600',
  },
  termsTextMuted: {
    color: '#64748b',
  },
  // Form error
  formErrorBox: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 16,
  },
  formErrorText: {
    fontSize: 13,
    color: '#ef4444',
    textAlign: 'center',
  },
  // Button
  button: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    borderCurve: 'continuous',
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 8px 20px -4px rgba(137, 90, 246, 0.35)',
  },
  buttonDisabled: {
    opacity: 0.55,
  },
  buttonPressed: {
    opacity: 0.88,
  },
  buttonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  // Login link
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  loginText: {
    fontSize: 14,
    color: '#64748b',
  },
  loginLink: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
  },
  // Confirmation screen
  confirmationWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 16,
  },
  confirmationIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#f3edff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  confirmationTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0f172a',
    textAlign: 'center',
  },
  confirmationText: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 22,
  },
  confirmationEmail: {
    fontWeight: '700',
    color: '#0f172a',
  },
  confirmationButton: {
    marginTop: 8,
    backgroundColor: colors.primary,
    borderRadius: 12,
    borderCurve: 'continuous',
    height: 50,
    paddingHorizontal: 32,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 8px 20px -4px rgba(137, 90, 246, 0.35)',
  },
  confirmationButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
})

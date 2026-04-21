import { AuthFooterLink } from '@/components/auth/AuthFooterLink'
import { AuthFormError } from '@/components/auth/AuthFormError'
import { AuthHeading } from '@/components/auth/AuthHeading'
import { UgcLogo } from '@/components/UgcLogo'
import { useSession } from '@/hooks/useSession'
import { getFriendlyRegisterError } from '@/services/auth.service'
import theme from '@/theme/theme'
import { Box, Text } from '@/theme/ui'
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
  TextInput,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

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
        router.replace('/(app)/' as never)
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
      <Box style={[styles.container, { paddingTop: insets.top }]}>
        <Box style={styles.confirmationWrap}>
          <Box backgroundColor="primarySurface" style={styles.confirmationIcon}>
            <Ionicons name="mail-outline" size={36} color={theme.colors.primary} />
          </Box>
          <Text style={styles.confirmationTitle}>Verifique seu e-mail</Text>
          <Text style={styles.confirmationText}>
            Enviamos um link de ativação para{' '}
            <Text style={styles.confirmationEmail}>{email}</Text>. Abra o e-mail e clique no
            link para ativar sua conta.
          </Text>
          <Pressable style={styles.confirmationButton} onPress={() => router.replace('/sign-in')}>
            <Text style={styles.confirmationButtonText}>Ir para o login</Text>
          </Pressable>
        </Box>
      </Box>
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
        <Box style={styles.header}>
          <Pressable
            style={styles.backButton}
            onPress={() => router.back()}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="chevron-back" size={22} color={theme.colors.textStrong} />
          </Pressable>
          <Box style={styles.logoRow}>
            <UgcLogo size={36} />
            <Text style={styles.logoText}>UGC Local</Text>
          </Box>
          <Box style={styles.headerSpacer} />
        </Box>

        <AuthHeading title="Crie sua conta" subtitle="Escolha como deseja usar a plataforma" />

        <Text style={styles.stepLabelPurple}>PASSO 1 · ESCOLHA SEU PERFIL</Text>
        <Box style={styles.roleCards}>
          {ROLE_OPTIONS.map(({ value, label, icon }) => {
            const selected = role === value
            return (
              <Pressable
                key={value}
                style={[styles.roleCard, selected && styles.roleCardSelected]}
                onPress={() => setRole(value)}
              >
                <Box style={[styles.roleCardIcon, selected && styles.roleCardIconSelected]}>
                  <Ionicons
                    name={icon}
                    size={20}
                    color={selected ? theme.colors.primaryPressed : theme.colors.textTertiary}
                  />
                </Box>
                <Text style={styles.roleCardLabel}>{label}</Text>
                {selected ? (
                  <Ionicons
                    name="checkmark-circle"
                    size={22}
                    color={theme.colors.primary}
                    style={styles.roleCardCheck}
                  />
                ) : null}
              </Pressable>
            )
          })}
        </Box>
        {role ? (
          <Text style={styles.roleCopy}>{ROLE_COPY[role]}</Text>
        ) : (
          <Text style={styles.roleCopyMuted}>Selecione uma opção acima para liberar o cadastro</Text>
        )}

        <Box style={styles.divider} />
        <Text style={styles.stepLabelSlate}>PASSO 2 · SEUS DADOS</Text>

        <Box style={styles.fieldWrap}>
          <Text variant="label">NOME COMPLETO</Text>
          <Box style={[styles.inputRow, errors.name ? styles.inputRowError : undefined]}>
            <Ionicons
              name="person-outline"
              size={16}
              color={theme.colors.textMuted}
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.inputText}
              placeholder="Como quer ser chamado?"
              placeholderTextColor={theme.colors.textMuted}
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
          </Box>
          {errors.name ? <Text style={styles.fieldError}>{errors.name}</Text> : null}
        </Box>

        <Box style={styles.fieldWrap}>
          <Text variant="label">E-MAIL</Text>
          <Box style={[styles.inputRow, errors.email ? styles.inputRowError : undefined]}>
            <Ionicons
              name="mail-outline"
              size={16}
              color={theme.colors.textMuted}
              style={styles.inputIcon}
            />
            <TextInput
              ref={emailRef}
              style={styles.inputText}
              placeholder="seu@email.com"
              placeholderTextColor={theme.colors.textMuted}
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
          </Box>
          {errors.email ? <Text style={styles.fieldError}>{errors.email}</Text> : null}
        </Box>

        <Box style={styles.fieldWrap}>
          <Text variant="label">SENHA</Text>
          <Box style={[styles.inputRow, errors.password ? styles.inputRowError : undefined]}>
            <Ionicons
              name="lock-closed-outline"
              size={16}
              color={theme.colors.textMuted}
              style={styles.inputIcon}
            />
            <TextInput
              ref={passwordRef}
              style={styles.inputText}
              placeholder="Mínimo 8 caracteres"
              placeholderTextColor={theme.colors.textMuted}
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
                color={theme.colors.textMuted}
              />
            </Pressable>
          </Box>
          {errors.password ? <Text style={styles.fieldError}>{errors.password}</Text> : null}
        </Box>

        <Box style={styles.fieldWrap}>
          <Text variant="label">CONFIRMAR SENHA</Text>
          <Box style={[styles.inputRow, errors.confirmPassword ? styles.inputRowError : undefined]}>
            <Ionicons
              name="lock-closed-outline"
              size={16}
              color={theme.colors.textMuted}
              style={styles.inputIcon}
            />
            <TextInput
              ref={confirmPasswordRef}
              style={styles.inputText}
              placeholder="Confirme sua senha"
              placeholderTextColor={theme.colors.textMuted}
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
                color={theme.colors.textMuted}
              />
            </Pressable>
          </Box>
          {errors.confirmPassword ? (
            <Text style={styles.fieldError}>{errors.confirmPassword}</Text>
          ) : null}
        </Box>

        <Pressable
          style={styles.termsRow}
          onPress={() => {
            setAcceptTerms((v) => !v)
            if (errors.acceptTerms) setErrors((p) => ({ ...p, acceptTerms: undefined }))
          }}
        >
          <Box style={[styles.checkbox, acceptTerms && styles.checkboxChecked]}>
            {acceptTerms ? <Ionicons name="checkmark" size={11} color={theme.colors.textInverse} /> : null}
          </Box>
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

        {errors.form ? <AuthFormError message={errors.form} /> : null}

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
            <ActivityIndicator color={theme.colors.textInverse} />
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

        <AuthFooterLink prefix="Já possui conta? " linkLabel="Faça login" onPress={() => router.back()} />
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.surface,
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
    color: theme.colors.textStrong,
    letterSpacing: -0.4,
  },
  headerSpacer: {
    width: 36,
  },
  stepLabelPurple: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.primary,
    letterSpacing: 0.9,
    textAlign: 'center',
    marginBottom: 12,
  },
  stepLabelSlate: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.textMuted,
    letterSpacing: 0.9,
    marginBottom: 16,
  },
  roleCards: {
    gap: 10,
    marginBottom: 10,
  },
  roleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1.5,
    borderColor: theme.colors.borderSubtle,
    borderRadius: 14,
    borderCurve: 'continuous',
    paddingHorizontal: 14,
    paddingVertical: 14,
    backgroundColor: theme.colors.surface,
  },
  roleCardSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primarySurface,
    ...theme.shadows.cardBrand,
  },
  roleCardIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    borderCurve: 'continuous',
    backgroundColor: theme.colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roleCardIconSelected: {
    backgroundColor: theme.colors.primarySurfaceAlt,
  },
  roleCardLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.textStrong,
  },
  roleCardCheck: {
    marginLeft: 4,
  },
  roleCopy: {
    fontSize: 12,
    fontWeight: '500',
    color: theme.colors.primary,
    textAlign: 'center',
    marginBottom: 4,
  },
  roleCopyMuted: {
    fontSize: 12,
    color: theme.colors.textMuted,
    textAlign: 'center',
    marginBottom: 4,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.surfaceAlt,
    marginVertical: 20,
  },
  fieldWrap: {
    marginBottom: 14,
    gap: 6,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.inputBackground,
    borderWidth: 1,
    borderColor: theme.colors.borderSubtle,
    borderRadius: 12,
    borderCurve: 'continuous',
    paddingHorizontal: 12,
    height: 50,
  },
  inputRowError: {
    borderColor: theme.colors.errorSubtle,
  },
  inputIcon: {
    marginRight: 8,
  },
  inputText: {
    flex: 1,
    fontSize: 15,
    color: theme.colors.textStrong,
    paddingVertical: 0,
  },
  fieldError: {
    fontSize: 12,
    color: theme.colors.error,
    marginTop: 2,
  },
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
    borderColor: theme.colors.borderSubtle,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
    flexShrink: 0,
  },
  checkboxChecked: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  termsText: {
    flex: 1,
    fontSize: 13,
    color: theme.colors.textSecondary,
    lineHeight: 18,
  },
  termsLink: {
    color: theme.colors.primary,
    fontWeight: '600',
  },
  termsTextMuted: {
    color: theme.colors.textTertiary,
  },
  button: {
    backgroundColor: theme.colors.primary,
    borderRadius: 12,
    borderCurve: 'continuous',
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.primary,
  },
  buttonDisabled: {
    opacity: 0.55,
  },
  buttonPressed: {
    opacity: 0.88,
  },
  buttonText: {
    color: theme.colors.textInverse,
    fontSize: 15,
    fontWeight: '700',
  },
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
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  confirmationTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: theme.colors.textStrong,
    textAlign: 'center',
  },
  confirmationText: {
    fontSize: 14,
    color: theme.colors.textTertiary,
    textAlign: 'center',
    lineHeight: 22,
  },
  confirmationEmail: {
    fontWeight: '700',
    color: theme.colors.textStrong,
  },
  confirmationButton: {
    marginTop: 8,
    backgroundColor: theme.colors.primary,
    borderRadius: 12,
    borderCurve: 'continuous',
    height: 50,
    paddingHorizontal: 32,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.primary,
  },
  confirmationButtonText: {
    color: theme.colors.textInverse,
    fontSize: 15,
    fontWeight: '700',
  },
})

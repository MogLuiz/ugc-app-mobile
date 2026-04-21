import { AuthFooterLink } from '@/components/auth/AuthFooterLink'
import { AuthFormError } from '@/components/auth/AuthFormError'
import { AuthHeading } from '@/components/auth/AuthHeading'
import { UgcLogo } from '@/components/UgcLogo'
import { useSession } from '@/hooks/useSession'
import { getFriendlyAuthError } from '@/services/auth.service'
import theme from '@/theme/theme'
import { Box, Text } from '@/theme/ui'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import { useRef, useState } from 'react'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
} from 'react-native'

type FormErrors = {
  email?: string
  password?: string
  form?: string
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function extractErrorMessage(err: unknown): string | undefined {
  if (!err || typeof err !== 'object') return undefined
  const e = err as Record<string, unknown>
  if (e.response && typeof e.response === 'object') {
    const res = e.response as Record<string, unknown>
    if (res.data && typeof res.data === 'object') {
      const data = res.data as Record<string, unknown>
      if (typeof data.message === 'string') return data.message
    }
  }
  if (typeof e.message === 'string') return e.message
  return undefined
}

export default function SignInScreen() {
  const { signIn } = useSession()
  const insets = useSafeAreaInsets()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const passwordRef = useRef<TextInput>(null)

  function validate(): FormErrors {
    const next: FormErrors = {}
    if (!email.trim()) {
      next.email = 'E-mail é obrigatório.'
    } else if (!EMAIL_REGEX.test(email.trim())) {
      next.email = 'Informe um e-mail válido.'
    }
    if (!password) {
      next.password = 'Senha é obrigatória.'
    } else if (password.length < 6) {
      next.password = 'A senha deve ter pelo menos 6 caracteres.'
    }
    return next
  }

  async function handleSubmit() {
    if (isSubmitting) return

    const validationErrors = validate()
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    setErrors({})
    setIsSubmitting(true)
    try {
      await signIn(email.trim(), password)
      router.replace('/(app)/(tabs)')
    } catch (err: unknown) {
      const raw = extractErrorMessage(err)
      setErrors({ form: getFriendlyAuthError(raw) })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={[styles.inner, { paddingTop: insets.top + 22 }]}
        keyboardShouldPersistTaps="handled"
        bounces={false}
      >
        <Box style={styles.logoRow}>
          <UgcLogo size={44} />
          <Text style={styles.logoText}>UGC Local</Text>
        </Box>

        <AuthHeading
          title="Bem-vindo de volta"
          subtitle="Acesse sua conta para gerenciar campanhas e conteúdos."
        />

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
              style={styles.inputText}
              placeholder="seu@email.com"
              placeholderTextColor={theme.colors.textMuted}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              autoFocus
              returnKeyType="next"
              value={email}
              onChangeText={(v) => {
                setEmail(v)
                if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }))
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
              placeholder="Sua senha"
              placeholderTextColor={theme.colors.textMuted}
              secureTextEntry={!showPassword}
              returnKeyType="done"
              value={password}
              onChangeText={(v) => {
                setPassword(v)
                if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }))
              }}
              onSubmitEditing={handleSubmit}
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

        <Box style={styles.rememberRow}>
          <Pressable onPress={() => router.push('/forgot-password')}>
            <Text style={styles.forgotText}>Esqueci a senha</Text>
          </Pressable>
        </Box>

        {errors.form ? <AuthFormError message={errors.form} /> : null}

        <Pressable
          style={({ pressed }) => [
            styles.button,
            isSubmitting && styles.buttonDisabled,
            pressed && !isSubmitting && styles.buttonPressed,
          ]}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color={theme.colors.textInverse} />
          ) : (
            <Text style={styles.buttonText}>Entrar</Text>
          )}
        </Pressable>

        <AuthFooterLink
          prefix="Não tem uma conta? "
          linkLabel="Cadastre-se grátis"
          onPress={() => router.push('/sign-up')}
        />
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
    justifyContent: 'flex-start',
    paddingHorizontal: 24,
    paddingBottom: 48,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 32,
  },
  logoText: {
    fontSize: 18,
    fontWeight: '900',
    color: theme.colors.textStrong,
    letterSpacing: -0.5,
  },
  fieldWrap: {
    marginBottom: 16,
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
  rememberRow: {
    alignItems: 'flex-end',
    marginBottom: 20,
    marginTop: 4,
  },
  forgotText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.primary,
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
    opacity: 0.6,
  },
  buttonPressed: {
    opacity: 0.88,
  },
  buttonText: {
    color: theme.colors.textInverse,
    fontSize: 15,
    fontWeight: '700',
  },
})

import { useSession } from '@/hooks/useSession'
import { getFriendlyAuthError } from '@/services/auth.service'
import { colors } from '@/theme/colors'
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
  Text,
  TextInput,
  View,
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
        {/* Logo */}
        <View style={styles.logoRow}>
          <View style={styles.logoIconWrap}>
            <Ionicons name="location" size={22} color="#fff" />
          </View>
          <Text style={styles.logoText}>UGC Local</Text>
        </View>

        {/* Heading */}
        <View style={styles.headingBlock}>
          <Text style={styles.heading}>Bem-vindo de volta</Text>
          <Text style={styles.subheading}>
            Acesse sua conta para gerenciar campanhas e conteúdos.
          </Text>
        </View>

        {/* Email */}
        <View style={styles.fieldWrap}>
          <Text style={styles.label}>E-MAIL</Text>
          <View style={[styles.inputRow, errors.email ? styles.inputRowError : undefined]}>
            <Ionicons name="mail-outline" size={16} color="#94a3b8" style={styles.inputIcon} />
            <TextInput
              style={styles.inputText}
              placeholder="seu@email.com"
              placeholderTextColor="#94a3b8"
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
          </View>
          {errors.email ? <Text style={styles.fieldError}>{errors.email}</Text> : null}
        </View>

        {/* Password */}
        <View style={styles.fieldWrap}>
          <Text style={styles.label}>SENHA</Text>
          <View style={[styles.inputRow, errors.password ? styles.inputRowError : undefined]}>
            <Ionicons
              name="lock-closed-outline"
              size={16}
              color="#94a3b8"
              style={styles.inputIcon}
            />
            <TextInput
              ref={passwordRef}
              style={styles.inputText}
              placeholder="Sua senha"
              placeholderTextColor="#94a3b8"
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
                color="#94a3b8"
              />
            </Pressable>
          </View>
          {errors.password ? <Text style={styles.fieldError}>{errors.password}</Text> : null}
        </View>

        {/* Forgot */}
        <View style={styles.rememberRow}>
          <Pressable>
            <Text style={styles.forgotText}>Esqueci a senha</Text>
          </Pressable>
        </View>

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
            isSubmitting && styles.buttonDisabled,
            pressed && !isSubmitting && styles.buttonPressed,
          ]}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Entrar</Text>
          )}
        </Pressable>

        {/* Register */}
        <View style={styles.registerRow}>
          <Text style={styles.registerText}>Não tem uma conta? </Text>
          <Pressable>
            <Text style={styles.registerLink}>Cadastre-se grátis</Text>
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
  logoIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderCurve: 'continuous',
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0f172a',
    letterSpacing: -0.5,
  },
  headingBlock: {
    alignItems: 'center',
    marginBottom: 28,
    gap: 6,
  },
  heading: {
    fontSize: 28,
    fontWeight: '900',
    color: '#0f172a',
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  subheading: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 20,
  },
  fieldWrap: {
    marginBottom: 16,
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
  rememberRow: {
    alignItems: 'flex-end',
    marginBottom: 20,
    marginTop: 4,
  },
  forgotText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
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
    opacity: 0.6,
  },
  buttonPressed: {
    opacity: 0.88,
  },
  buttonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  registerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  registerText: {
    fontSize: 14,
    color: '#64748b',
  },
  registerLink: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
  },
})

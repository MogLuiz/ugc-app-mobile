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
import { router } from 'expo-router'
import { useSession } from '@/hooks/useSession'
import { getFriendlyAuthError } from '@/services/auth.service'
import { colors } from '@/theme/colors'

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
        contentContainerStyle={styles.inner}
        keyboardShouldPersistTaps="handled"
        bounces={false}
      >
        <Text style={styles.title}>UGC Local</Text>
        <Text style={styles.subtitle}>Entre na sua conta</Text>

        <View style={styles.field}>
          <TextInput
            style={[styles.input, !!errors.email && styles.inputError]}
            placeholder="E-mail"
            placeholderTextColor={colors.text.secondary.light}
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
          {errors.email ? <Text style={styles.fieldError}>{errors.email}</Text> : null}
        </View>

        <View style={styles.field}>
          <View style={[styles.passwordContainer, !!errors.password && styles.inputError]}>
            <TextInput
              ref={passwordRef}
              style={styles.passwordInput}
              placeholder="Senha"
              placeholderTextColor={colors.text.secondary.light}
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
              <Text style={styles.toggleText}>{showPassword ? 'Ocultar' : 'Mostrar'}</Text>
            </Pressable>
          </View>
          {errors.password ? <Text style={styles.fieldError}>{errors.password}</Text> : null}
        </View>

        {errors.form ? (
          <View style={styles.formErrorBox}>
            <Text style={styles.formErrorText}>{errors.form}</Text>
          </View>
        ) : null}

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
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.light,
  },
  inner: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.primary,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.text.secondary.light,
    textAlign: 'center',
    marginBottom: 40,
  },
  field: {
    marginBottom: 16,
  },
  input: {
    backgroundColor: colors.surface.light,
    borderWidth: 1,
    borderColor: colors.border.light,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: colors.text.primary.light,
  },
  inputError: {
    borderColor: colors.error,
  },
  fieldError: {
    marginTop: 4,
    fontSize: 13,
    color: colors.error,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface.light,
    borderWidth: 1,
    borderColor: colors.border.light,
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
    color: colors.text.primary.light,
  },
  toggleText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
    paddingLeft: 8,
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
    fontSize: 14,
    color: colors.error,
    textAlign: 'center',
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonPressed: {
    opacity: 0.85,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
})

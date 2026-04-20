import { authService, getFriendlyForgotPasswordError } from '@/services/auth.service'
import { colors } from '@/theme/colors'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import { useState } from 'react'
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

export default function ForgotPasswordScreen() {
  const insets = useSafeAreaInsets()
  const [email, setEmail] = useState('')
  const [emailError, setEmailError] = useState<string | undefined>()
  const [globalError, setGlobalError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  function validate(): boolean {
    if (!email.trim()) {
      setEmailError('E-mail é obrigatório.')
      return false
    }
    if (!EMAIL_REGEX.test(email.trim())) {
      setEmailError('Informe um e-mail válido.')
      return false
    }
    return true
  }

  async function handleSubmit() {
    if (isSubmitting) return
    if (!validate()) return
    setGlobalError(null)
    setIsSubmitting(true)
    try {
      await authService.forgotPassword(email.trim())
      setSubmitted(true)
    } catch (err: unknown) {
      const raw = extractErrorMessage(err)
      setGlobalError(getFriendlyForgotPasswordError(raw))
    } finally {
      setIsSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <View
        style={[
          styles.container,
          { paddingTop: insets.top + 22, paddingBottom: insets.bottom + 24 },
        ]}
      >
        {/* Logo */}
        <View style={styles.logoRow}>
          <View style={styles.logoIconWrap}>
            <Ionicons name="location" size={22} color="#fff" />
          </View>
          <Text style={styles.logoText}>UGC Local</Text>
        </View>

        <View style={styles.successContent}>
          <View style={styles.successIconWrap}>
            <Ionicons name="mail-outline" size={36} color={colors.primary} />
          </View>
          <Text style={styles.heading}>Verifique seu e-mail</Text>
          <Text style={styles.successMessage}>
            Se existir uma conta com esse e-mail, você receberá um link para redefinição em breve.
          </Text>
        </View>

        <Pressable
          style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
          onPress={() => router.replace('/sign-in')}
        >
          <Text style={styles.buttonText}>Voltar para o login</Text>
        </Pressable>
      </View>
    )
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
        {/* Logo + Back */}
        <View style={styles.logoRow}>
          <Pressable
            onPress={() => router.back()}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="arrow-back" size={22} color="#0f172a" />
          </Pressable>
          <View style={styles.logoMark}>
            <View style={styles.logoIconWrap}>
              <Ionicons name="location" size={22} color="#fff" />
            </View>
            <Text style={styles.logoText}>UGC Local</Text>
          </View>
          <View style={styles.logoSpacer} />
        </View>

        {/* Heading */}
        <View style={styles.headingBlock}>
          <Text style={styles.heading}>Esqueci a senha</Text>
          <Text style={styles.subheading}>
            Informe seu e-mail e enviaremos um link para redefinir sua senha.
          </Text>
        </View>

        {/* Email */}
        <View style={styles.fieldWrap}>
          <Text style={styles.label}>E-MAIL</Text>
          <View style={[styles.inputRow, emailError ? styles.inputRowError : undefined]}>
            <Ionicons name="mail-outline" size={16} color="#94a3b8" style={styles.inputIcon} />
            <TextInput
              style={styles.inputText}
              placeholder="seu@email.com"
              placeholderTextColor="#94a3b8"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              autoFocus
              returnKeyType="done"
              value={email}
              onChangeText={(v) => {
                setEmail(v)
                if (emailError) setEmailError(undefined)
              }}
              onSubmitEditing={handleSubmit}
              editable={!isSubmitting}
            />
          </View>
          {emailError ? <Text style={styles.fieldError}>{emailError}</Text> : null}
        </View>

        {/* Global error */}
        {globalError ? (
          <View style={styles.formErrorBox}>
            <Text style={styles.formErrorText}>{globalError}</Text>
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
            <Text style={styles.buttonText}>Enviar link</Text>
          )}
        </Pressable>

        {/* Back to login */}
        <View style={styles.backToLoginRow}>
          <Text style={styles.backToLoginText}>Lembrou a senha? </Text>
          <Pressable onPress={() => router.back()}>
            <Text style={styles.backToLoginLink}>Entrar</Text>
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
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  logoMark: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoSpacer: {
    width: 22,
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
  backToLoginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  backToLoginText: {
    fontSize: 14,
    color: '#64748b',
  },
  backToLoginLink: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
  },
  // success state
  successContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 16,
  },
  successIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 20,
    borderCurve: 'continuous',
    backgroundColor: '#f3eeff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  successMessage: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 300,
  },
})

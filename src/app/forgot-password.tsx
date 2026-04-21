import { AuthFooterLink } from '@/components/auth/AuthFooterLink'
import { AuthFormError } from '@/components/auth/AuthFormError'
import { AuthHeading } from '@/components/auth/AuthHeading'
import { UgcLogo } from '@/components/UgcLogo'
import { authService, getFriendlyForgotPasswordError } from '@/services/auth.service'
import theme from '@/theme/theme'
import { Box, Text } from '@/theme/ui'
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
  TextInput,
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
      <Box
        style={[
          styles.container,
          { paddingTop: insets.top + 22, paddingBottom: insets.bottom + 24 },
        ]}
      >
        <Box style={styles.logoRow}>
          <UgcLogo size={44} />
          <Text style={styles.logoText}>UGC Local</Text>
        </Box>

        <Box style={styles.successContent}>
          <Box backgroundColor="primarySurface" style={styles.successIconWrap}>
            <Ionicons name="mail-outline" size={36} color={theme.colors.primary} />
          </Box>
          <Text style={styles.heading}>Verifique seu e-mail</Text>
          <Text style={styles.successMessage}>
            Se existir uma conta com esse e-mail, você receberá um link para redefinição em breve.
          </Text>
        </Box>

        <Pressable
          style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
          onPress={() => router.replace('/sign-in')}
        >
          <Text style={styles.buttonText}>Voltar para o login</Text>
        </Pressable>
      </Box>
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
        <Box style={styles.logoRow}>
          <Pressable
            onPress={() => router.back()}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="arrow-back" size={22} color={theme.colors.textStrong} />
          </Pressable>
          <Box style={styles.logoMark}>
            <UgcLogo size={44} />
            <Text style={styles.logoText}>UGC Local</Text>
          </Box>
          <Box style={styles.logoSpacer} />
        </Box>

        <AuthHeading
          title="Esqueci a senha"
          subtitle="Informe seu e-mail e enviaremos um link para redefinir sua senha."
        />

        <Box style={styles.fieldWrap}>
          <Text variant="label">E-MAIL</Text>
          <Box style={[styles.inputRow, emailError ? styles.inputRowError : undefined]}>
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
              returnKeyType="done"
              value={email}
              onChangeText={(v) => {
                setEmail(v)
                if (emailError) setEmailError(undefined)
              }}
              onSubmitEditing={handleSubmit}
              editable={!isSubmitting}
            />
          </Box>
          {emailError ? <Text style={styles.fieldError}>{emailError}</Text> : null}
        </Box>

        {globalError ? <AuthFormError message={globalError} /> : null}

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
            <Text style={styles.buttonText}>Enviar link</Text>
          )}
        </Pressable>

        <AuthFooterLink prefix="Lembrou a senha? " linkLabel="Entrar" onPress={() => router.back()} />
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
  logoText: {
    fontSize: 18,
    fontWeight: '900',
    color: theme.colors.textStrong,
    letterSpacing: -0.5,
  },
  heading: {
    fontSize: 28,
    fontWeight: '900',
    color: theme.colors.textStrong,
    letterSpacing: -0.5,
    textAlign: 'center',
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
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  successMessage: {
    fontSize: 14,
    color: theme.colors.textTertiary,
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 300,
  },
})

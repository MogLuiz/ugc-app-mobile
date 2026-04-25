import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'
import { useState } from 'react'
import { Feather, Ionicons } from '@expo/vector-icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { MobileEmptyState } from '@/components/MobileEmptyState'
import {
  usePayoutSettingsQuery,
  useUpdatePayoutSettingsMutation,
} from '@/modules/creator-payouts/queries'
import type { PixKeyType } from '@/modules/creator-payouts/types'
import { colors } from '@/theme/colors'
import theme from '@/theme/theme'

const KEY_TYPE_LABELS: Record<PixKeyType, string> = {
  cpf: 'CPF',
  cnpj: 'CNPJ',
  email: 'E-mail',
  phone: 'Telefone',
  random: 'Chave aleatória',
}

const PIX_KEY_PLACEHOLDERS: Record<PixKeyType, string> = {
  cpf: '000.000.000-00',
  cnpj: '00.000.000/0000-00',
  email: 'seu@email.com',
  phone: '(00) 00000-0000',
  random: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
}

const PIX_KEY_TYPES: PixKeyType[] = ['cpf', 'cnpj', 'email', 'phone', 'random']

type FormFields = {
  pixKeyType: PixKeyType
  pixKey: string
  holderName: string
  holderDocument: string
}

type FormErrors = {
  pixKeyType?: string
  pixKey?: string
  form?: string
}

function validate(fields: FormFields): FormErrors {
  const errs: FormErrors = {}
  if (!fields.pixKeyType) errs.pixKeyType = 'Selecione o tipo da chave PIX.'
  if (!fields.pixKey.trim()) errs.pixKey = 'Informe a chave PIX.'
  return errs
}

function defaultForm(settings?: { pixKeyType?: PixKeyType | null; pixKey?: string | null; holderName?: string | null; holderDocument?: string | null }): FormFields {
  return {
    pixKeyType: settings?.pixKeyType ?? 'cpf',
    pixKey: '',
    holderName: settings?.holderName ?? '',
    holderDocument: settings?.holderDocument ?? '',
  }
}

// ─── Skeleton ────────────────────────────────────────────────────────────────

function PixSkeleton() {
  return (
    <View style={styles.card}>
      {Array.from({ length: 3 }).map((_, i) => (
        <View key={i} style={styles.skeletonRow}>
          <View style={styles.skeletonLabel} />
          <View style={styles.skeletonValue} />
        </View>
      ))}
    </View>
  )
}

// ─── TypePicker Modal ─────────────────────────────────────────────────────────

function TypePickerModal({
  visible,
  selected,
  onSelect,
  onClose,
}: {
  visible: boolean
  selected: PixKeyType
  onSelect: (type: PixKeyType) => void
  onClose: () => void
}) {
  const insets = useSafeAreaInsets()
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <Pressable style={pickerStyles.overlay} onPress={onClose}>
        <Pressable
          style={[pickerStyles.sheet, { paddingBottom: Math.max(insets.bottom, 16) }]}
          onPress={() => {}}
        >
          <View style={pickerStyles.handleWrapper}>
            <View style={pickerStyles.handle} />
          </View>
          <Text style={pickerStyles.title}>Tipo de chave PIX</Text>
          {PIX_KEY_TYPES.map((type, index) => (
            <Pressable
              key={type}
              style={({ pressed }) => [
                pickerStyles.option,
                index < PIX_KEY_TYPES.length - 1 && pickerStyles.optionBorder,
                pressed && pickerStyles.optionPressed,
              ]}
              onPress={() => {
                onSelect(type)
                onClose()
              }}
            >
              <Text style={pickerStyles.optionLabel}>{KEY_TYPE_LABELS[type]}</Text>
              {selected === type ? (
                <Ionicons name="checkmark" size={18} color={colors.primary} />
              ) : null}
            </Pressable>
          ))}
        </Pressable>
      </Pressable>
    </Modal>
  )
}

// ─── View mode ────────────────────────────────────────────────────────────────

function PixViewMode({
  pixKeyType,
  pixKeyMasked,
  holderName,
  holderDocument,
  onEdit,
}: {
  pixKeyType: PixKeyType | null
  pixKeyMasked: string | null
  holderName: string | null
  holderDocument: string | null
  onEdit: () => void
}) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Dados de recebimento</Text>
      <View style={styles.cardDivider} />
      <View style={styles.viewRows}>
        <ViewRow label="Tipo de chave" value={pixKeyType ? KEY_TYPE_LABELS[pixKeyType] : '—'} />
        <ViewRow label="Chave PIX" value={pixKeyMasked ?? '—'} mono />
        <ViewRow label="Titular" value={holderName ?? '—'} />
        <ViewRow label="Documento do titular" value={holderDocument ?? '—'} />
      </View>
      <Pressable
        style={({ pressed }) => [styles.editLink, pressed && { opacity: 0.6 }]}
        onPress={onEdit}
        accessibilityRole="button"
      >
        <Text style={styles.editLinkText}>Editar dados PIX</Text>
      </Pressable>
    </View>
  )
}

function ViewRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <View style={styles.viewRow}>
      <Text style={styles.viewRowLabel}>{label}</Text>
      <Text style={[styles.viewRowValue, mono && styles.viewRowMono]} numberOfLines={1}>
        {value}
      </Text>
    </View>
  )
}

// ─── Edit form ────────────────────────────────────────────────────────────────

function PixEditForm({
  initialValues,
  onSuccess,
  onCancel,
}: {
  initialValues: FormFields
  onSuccess: () => void
  onCancel: () => void
}) {
  const mutation = useUpdatePayoutSettingsMutation()
  const [fields, setFields] = useState<FormFields>(initialValues)
  const [errors, setErrors] = useState<FormErrors>({})
  const [typePickerOpen, setTypePickerOpen] = useState(false)

  function setField<K extends keyof FormFields>(key: K, value: FormFields[K]) {
    setFields((prev) => ({ ...prev, [key]: value }))
    if (errors[key as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [key]: undefined }))
    }
  }

  function handleTypeSelect(type: PixKeyType) {
    setFields((prev) => ({ ...prev, pixKeyType: type, pixKey: '' }))
    setErrors((prev) => ({ ...prev, pixKeyType: undefined }))
  }

  async function handleSubmit() {
    if (mutation.isPending) return
    const validationErrors = validate(fields)
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }
    setErrors({})
    try {
      await mutation.mutateAsync({
        pixKeyType: fields.pixKeyType,
        pixKey: fields.pixKey.trim(),
        holderName: fields.holderName.trim() || null,
        holderDocument: fields.holderDocument.trim() || null,
      })
      onSuccess()
      Alert.alert('Dados PIX salvos', 'Sua chave PIX foi atualizada com sucesso.')
    } catch {
      setErrors({ form: 'Não foi possível salvar os dados PIX. Tente novamente.' })
    }
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Configurar dados PIX</Text>
        <Text style={styles.cardSubtitle}>Esses dados serão usados para recebimento dos repasses.</Text>
        <View style={styles.cardDivider} />

        {errors.form ? (
          <View style={styles.bannerError}>
            <Text style={styles.bannerErrorText}>{errors.form}</Text>
          </View>
        ) : null}

        <View style={styles.formBody}>
          {/* Tipo de chave */}
          <View style={styles.fieldWrap}>
            <Text style={styles.fieldLabel}>TIPO DE CHAVE</Text>
            <Pressable
              style={[styles.typeSelector, errors.pixKeyType ? styles.inputError : undefined]}
              onPress={() => setTypePickerOpen(true)}
              accessibilityRole="button"
            >
              <Text style={styles.typeSelectorText}>{KEY_TYPE_LABELS[fields.pixKeyType]}</Text>
              <Ionicons name="chevron-down" size={16} color={theme.colors.textSecondary} />
            </Pressable>
            {errors.pixKeyType ? <Text style={styles.fieldError}>{errors.pixKeyType}</Text> : null}
          </View>

          {/* Chave PIX */}
          <View style={styles.fieldWrap}>
            <Text style={styles.fieldLabel}>CHAVE PIX</Text>
            <TextInput
              style={[styles.textInput, errors.pixKey ? styles.inputError : undefined]}
              placeholder={PIX_KEY_PLACEHOLDERS[fields.pixKeyType]}
              placeholderTextColor={theme.colors.textMuted}
              value={fields.pixKey}
              onChangeText={(v) => setField('pixKey', v)}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="next"
              editable={!mutation.isPending}
            />
            {errors.pixKey ? <Text style={styles.fieldError}>{errors.pixKey}</Text> : null}
          </View>

          {/* Nome do titular */}
          <View style={styles.fieldWrap}>
            <Text style={styles.fieldLabel}>NOME DO TITULAR</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Opcional"
              placeholderTextColor={theme.colors.textMuted}
              value={fields.holderName}
              onChangeText={(v) => setField('holderName', v)}
              autoCapitalize="words"
              returnKeyType="next"
              editable={!mutation.isPending}
            />
          </View>

          {/* Documento do titular */}
          <View style={styles.fieldWrap}>
            <Text style={styles.fieldLabel}>DOCUMENTO DO TITULAR</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Opcional"
              placeholderTextColor={theme.colors.textMuted}
              value={fields.holderDocument}
              onChangeText={(v) => setField('holderDocument', v)}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="numeric"
              returnKeyType="done"
              onSubmitEditing={handleSubmit}
              editable={!mutation.isPending}
            />
          </View>

          {/* Ações */}
          <Pressable
            style={({ pressed }) => [
              styles.submitButton,
              pressed && !mutation.isPending && styles.submitButtonPressed,
              mutation.isPending && styles.submitButtonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={mutation.isPending}
            accessibilityRole="button"
          >
            {mutation.isPending ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.submitButtonText}>Salvar dados PIX</Text>
            )}
          </Pressable>

          <Pressable
            style={({ pressed }) => [styles.cancelButton, pressed && styles.cancelButtonPressed]}
            onPress={onCancel}
            disabled={mutation.isPending}
            accessibilityRole="button"
          >
            <Text style={styles.cancelButtonText}>Cancelar</Text>
          </Pressable>
        </View>
      </View>

      <TypePickerModal
        visible={typePickerOpen}
        selected={fields.pixKeyType}
        onSelect={handleTypeSelect}
        onClose={() => setTypePickerOpen(false)}
      />
    </KeyboardAvoidingView>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export function PixDataBlock() {
  const { data: settings, isLoading } = usePayoutSettingsQuery()
  const [isEditing, setIsEditing] = useState(false)

  if (isLoading) return <PixSkeleton />

  if (!isEditing && !settings?.isConfigured) {
    return (
      <MobileEmptyState
        title="Nenhuma chave PIX cadastrada"
        description="Cadastre sua chave PIX para receber seus repasses direto na sua conta."
        actions={
          <Pressable
            style={({ pressed }) => [styles.submitButton, pressed && styles.submitButtonPressed]}
            onPress={() => setIsEditing(true)}
            accessibilityRole="button"
          >
            <Text style={styles.submitButtonText}>Cadastrar chave PIX</Text>
          </Pressable>
        }
      />
    )
  }

  if (!isEditing && settings?.isConfigured) {
    return (
      <PixViewMode
        pixKeyType={settings.pixKeyType}
        pixKeyMasked={settings.pixKeyMasked}
        holderName={settings.holderName}
        holderDocument={settings.holderDocument}
        onEdit={() => setIsEditing(true)}
      />
    )
  }

  return (
    <PixEditForm
      initialValues={defaultForm(settings)}
      onSuccess={() => setIsEditing(false)}
      onCancel={() => setIsEditing(false)}
    />
  )
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadii.card,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
    padding: 20,
    gap: 12,
    ...theme.shadows.cardNeutral,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.textStrong,
  },
  cardSubtitle: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    lineHeight: 18,
    marginTop: -4,
  },
  cardDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: theme.colors.border,
    marginHorizontal: -20,
  },
  viewRows: {
    gap: 12,
  },
  viewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  viewRowLabel: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    flexShrink: 0,
  },
  viewRowValue: {
    fontSize: 13,
    fontWeight: '500',
    color: theme.colors.textStrong,
    textAlign: 'right',
    flex: 1,
  },
  viewRowMono: {
    fontVariant: ['tabular-nums'],
    fontSize: 13,
  },
  editLink: {
    alignSelf: 'center',
    paddingVertical: 4,
  },
  editLinkText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  bannerError: {
    backgroundColor: theme.colors.errorSurface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.errorBorder,
    borderRadius: theme.borderRadii.lg,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  bannerErrorText: {
    fontSize: 13,
    fontWeight: '500',
    color: theme.colors.error,
  },
  formBody: {
    gap: 16,
  },
  fieldWrap: {
    gap: 6,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.textMuted,
    letterSpacing: 0.8,
  },
  fieldError: {
    fontSize: 12,
    fontWeight: '500',
    color: theme.colors.error,
  },
  textInput: {
    height: 48,
    borderRadius: theme.borderRadii.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.inputBackground,
    paddingHorizontal: 14,
    fontSize: 15,
    color: theme.colors.textStrong,
  },
  typeSelector: {
    height: 48,
    borderRadius: theme.borderRadii.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.inputBackground,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  typeSelectorText: {
    fontSize: 15,
    color: theme.colors.textStrong,
  },
  inputError: {
    borderColor: theme.colors.error,
  },
  submitButton: {
    height: 50,
    borderRadius: theme.borderRadii.lg,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
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
  cancelButton: {
    height: 48,
    borderRadius: theme.borderRadii.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonPressed: {
    opacity: 0.7,
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.text,
  },
  skeletonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  skeletonLabel: {
    width: '35%',
    height: 13,
    borderRadius: 999,
    backgroundColor: colors.border.light,
  },
  skeletonValue: {
    width: '45%',
    height: 13,
    borderRadius: 999,
    backgroundColor: colors.border.light,
    opacity: 0.6,
  },
})

const pickerStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: theme.borderRadii.card,
    borderTopRightRadius: theme.borderRadii.card,
  },
  handleWrapper: {
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 4,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.colors.borderSubtle,
  },
  title: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 20,
    paddingBottom: 8,
    letterSpacing: 0.4,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    minHeight: 52,
  },
  optionBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.border,
  },
  optionPressed: {
    backgroundColor: theme.colors.backgroundAlt,
  },
  optionLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: theme.colors.text,
  },
})

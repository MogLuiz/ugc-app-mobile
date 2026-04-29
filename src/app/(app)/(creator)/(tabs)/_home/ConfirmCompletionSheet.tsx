import { Alert, Modal, Pressable, StyleSheet, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useConfirmCompletionMutation } from '@/modules/contract-requests/queries'
import { getInitials } from '@/lib/formatters'
import { colors } from '@/theme/colors'
import type { PendingActionVm } from '@/modules/creator-home/types'

type Props = {
  item: PendingActionVm | null
  visible: boolean
  onClose: () => void
  onSuccess: () => void
  onReportProblem: (itemId: string) => void
}

export function ConfirmCompletionSheet({
  item,
  visible,
  onClose,
  onSuccess,
  onReportProblem,
}: Props) {
  const insets = useSafeAreaInsets()
  const confirmMutation = useConfirmCompletionMutation()

  function handleConfirm() {
    if (!item) return
    confirmMutation.mutate(item.id, {
      onSuccess: () => {
        onSuccess()
        Alert.alert('Pronto!', 'Serviço confirmado com sucesso.')
      },
      onError: (err) =>
        Alert.alert(
          'Erro',
          err instanceof Error ? err.message : 'Não foi possível confirmar o serviço.',
        ),
    })
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable
          style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 24) }]}
          onPress={() => {}}
        >
          {/* Handle + header */}
          <View style={styles.handleWrapper}>
            <View style={styles.handle} />
          </View>

          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>Confirmar serviço realizado</Text>
            <Pressable onPress={onClose} hitSlop={8} accessibilityLabel="Fechar">
              <Ionicons name="close" size={22} color={colors.text.secondary.light} />
            </Pressable>
          </View>

          {item ? (
            <View style={styles.body}>
              {/* Company identity */}
              <View style={styles.identityRow}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{getInitials(item.companyName)}</Text>
                </View>
                <View style={styles.identityText}>
                  <Text style={styles.companyName} numberOfLines={1}>
                    {item.companyName}
                  </Text>
                  <Text style={styles.title} numberOfLines={1}>
                    {item.title}
                  </Text>
                  {item.dateLabel ? (
                    <Text style={styles.dateLabel}>{item.dateLabel}</Text>
                  ) : null}
                </View>
              </View>

              {/* Question */}
              <View style={styles.questionCard}>
                <Ionicons name="help-circle-outline" size={18} color={colors.primary} />
                <Text style={styles.questionText}>Você realizou este serviço?</Text>
              </View>

              {/* Confirm button */}
              <Pressable
                style={({ pressed }) => [
                  styles.confirmButton,
                  confirmMutation.isPending && styles.confirmButtonDisabled,
                  pressed && !confirmMutation.isPending && styles.confirmButtonPressed,
                ]}
                onPress={handleConfirm}
                disabled={confirmMutation.isPending}
              >
                <Ionicons name="checkmark-circle-outline" size={16} color="#fff" />
                <Text style={styles.confirmButtonText}>
                  {confirmMutation.isPending ? 'Confirmando…' : 'Confirmar realização'}
                </Text>
              </Pressable>

              {/* Report problem link */}
              <Pressable
                style={({ pressed }) => [styles.reportLink, pressed && styles.reportLinkPressed]}
                onPress={() => onReportProblem(item.id)}
              >
                <Text style={styles.reportLinkText}>Reportar problema nos detalhes</Text>
              </Pressable>
            </View>
          ) : null}
        </Pressable>
      </Pressable>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 16,
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
    backgroundColor: '#e2e8f0',
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border.light,
  },
  sheetTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text.primary.light,
  },
  body: {
    paddingHorizontal: 20,
    paddingTop: 20,
    gap: 16,
  },
  identityRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#ede9fb',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  avatarText: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.primary,
  },
  identityText: { flex: 1, gap: 3 },
  companyName: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text.primary.light,
    letterSpacing: -0.1,
  },
  title: {
    fontSize: 13,
    color: colors.text.secondary.light,
  },
  dateLabel: {
    fontSize: 12,
    color: colors.text.secondary.light,
    opacity: 0.75,
  },
  questionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#f3edff',
    borderRadius: 12,
    padding: 12,
  },
  questionText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  confirmButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.primary,
    borderRadius: 999,
    paddingVertical: 14,
  },
  confirmButtonDisabled: { opacity: 0.5 },
  confirmButtonPressed: { opacity: 0.85 },
  confirmButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },
  reportLink: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  reportLinkPressed: { opacity: 0.6 },
  reportLinkText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.text.secondary.light,
    textDecorationLine: 'underline',
  },
})

import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { formatCurrency } from '@/lib/formatters'
import type { CreatorPayout } from '@/modules/creator-payouts/types'
import { colors } from '@/theme/colors'
import theme from '@/theme/theme'
import { PayoutStatusBadge } from './PayoutStatusBadge'

const STATUS_DESCRIPTIONS: Record<string, string> = {
  not_due: 'O serviço ainda está em andamento. O repasse será liberado após confirmação.',
  pending: 'Repasse aguardando processamento pela equipe.',
  scheduled: 'Repasse agendado. O valor será enviado na data prevista.',
  paid: 'Valor enviado para sua chave PIX.',
  failed: 'Ocorreu um problema no repasse. Entre em contato com o suporte.',
  canceled: 'Este repasse foi cancelado.',
}

function formatDateBR(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

type Props = {
  payout: CreatorPayout | null
  onClose: () => void
}

export function PayoutDetailSheet({ payout, onClose }: Props) {
  const router = useRouter()
  const insets = useSafeAreaInsets()

  const visible = payout !== null

  function handleVerCampanha(contractRequestId: string) {
    onClose()
    router.push(`/(creator)/propostas/${contractRequestId}` as never)
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
          {/* Handle */}
          <View style={styles.handleWrapper}>
            <View style={styles.handle} />
          </View>

          {/* Header */}
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>Detalhe do repasse</Text>
            <Pressable
              onPress={onClose}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="Fechar"
            >
              <Ionicons name="close" size={22} color={theme.colors.textSecondary} />
            </Pressable>
          </View>

          {payout ? <PayoutDetailContent payout={payout} onVerCampanha={handleVerCampanha} /> : null}
        </Pressable>
      </Pressable>
    </Modal>
  )
}

function PayoutDetailContent({
  payout,
  onVerCampanha,
}: {
  payout: CreatorPayout
  onVerCampanha: (contractRequestId: string) => void
}) {
  const ref = payout.id.slice(-8).toUpperCase()
  const payment = payout.payment
  const contractRequestId = payment?.contractRequestId ?? null

  return (
    <ScrollView
      style={styles.scrollArea}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Status + ID + Data */}
      <View style={styles.section}>
        <PayoutStatusBadge status={payout.status} size="md" />
        <Text style={styles.ref}>Repasse #{ref}</Text>
        {payout.status === 'paid' && payout.paidAt ? (
          <Text style={styles.dateText}>Recebido em {formatDateBR(payout.paidAt)}</Text>
        ) : null}
        {payout.scheduledFor && payout.status !== 'paid' ? (
          <Text style={styles.dateText}>Previsto para {formatDateBR(payout.scheduledFor)}</Text>
        ) : null}
      </View>

      {/* Breakdown financeiro */}
      <View style={styles.breakdownCard}>
        <Text style={styles.breakdownTitle}>SEU VALOR</Text>
        {payment ? (
          <View style={styles.breakdownRows}>
            <BreakdownRow
              label="Serviço"
              value={formatCurrency(payment.creatorNetServiceAmountCents / 100)}
            />
            {payment.transportFeeAmountCents > 0 && (
              <BreakdownRow
                label="Transporte"
                value={formatCurrency(payment.transportFeeAmountCents / 100)}
              />
            )}
            <View style={styles.divider} />
            <BreakdownRow
              label="Total a receber"
              value={formatCurrency(payout.amountCents / 100)}
              labelStyle={styles.labelBold}
              valueStyle={styles.valueBold}
            />
          </View>
        ) : (
          <View style={styles.breakdownRows}>
            <BreakdownRow
              label="Total a receber"
              value={formatCurrency(payout.amountCents / 100)}
              labelStyle={styles.labelBold}
              valueStyle={styles.valueBold}
            />
          </View>
        )}
      </View>

      {/* Situação */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>SITUAÇÃO</Text>
        <Text style={styles.statusDescription}>
          {STATUS_DESCRIPTIONS[payout.status] ?? '—'}
        </Text>
      </View>

      {/* Ver campanha */}
      {contractRequestId ? (
        <Pressable
          style={({ pressed }) => [styles.campaignButton, pressed && styles.campaignButtonPressed]}
          onPress={() => onVerCampanha(contractRequestId)}
          accessibilityRole="button"
        >
          <Text style={styles.campaignButtonLabel}>Ver campanha</Text>
          <Ionicons name="arrow-forward" size={16} color={theme.colors.textSecondary} />
        </Pressable>
      ) : null}
    </ScrollView>
  )
}

function BreakdownRow({
  label,
  value,
  labelStyle,
  valueStyle,
}: {
  label: string
  value: string
  labelStyle?: object
  valueStyle?: object
}) {
  return (
    <View style={styles.breakdownRow}>
      <Text style={[styles.breakdownLabel, labelStyle]}>{label}</Text>
      <Text style={[styles.breakdownValue, valueStyle]}>{value}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: theme.borderRadii.card,
    borderTopRightRadius: theme.borderRadii.card,
    maxHeight: '85%',
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
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.border,
  },
  sheetTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.textStrong,
  },
  scrollArea: {
    flexGrow: 0,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 8,
    gap: 20,
  },
  section: {
    gap: 8,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.textSecondary,
    letterSpacing: 1,
  },
  ref: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.textStrong,
  },
  dateText: {
    fontSize: 13,
    color: theme.colors.textSecondary,
  },
  breakdownCard: {
    backgroundColor: colors.background.light,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border.light,
    padding: 16,
    gap: 12,
    borderCurve: 'continuous',
  } as object,
  breakdownTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.textSecondary,
    letterSpacing: 1,
  },
  breakdownRows: {
    gap: 10,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  breakdownLabel: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    flex: 1,
  },
  breakdownValue: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border.light,
  },
  labelBold: {
    fontWeight: '700',
    color: theme.colors.textStrong,
  },
  valueBold: {
    fontWeight: '800',
    color: theme.colors.textStrong,
    fontSize: 15,
  },
  valueMuted: {
    color: theme.colors.textSecondary,
  },
  statusDescription: {
    fontSize: 14,
    color: theme.colors.text,
    lineHeight: 20,
  },
  campaignButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.background.light,
    borderWidth: 1,
    borderColor: colors.border.light,
    borderRadius: 14,
    paddingVertical: 14,
    borderCurve: 'continuous',
  } as object,
  campaignButtonPressed: {
    opacity: 0.7,
  },
  campaignButtonLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
  },
})

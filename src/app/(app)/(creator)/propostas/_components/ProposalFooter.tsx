import { Alert, Pressable, StyleSheet, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import type { ContractRequestItem } from '@/modules/contract-requests/types'

function getExpiryLabel(expiresAt?: string): string | null {
  if (!expiresAt) return null
  const diff = new Date(expiresAt).getTime() - Date.now()
  if (diff <= 0) return null
  const hours = Math.floor(diff / (1000 * 60 * 60))
  if (hours < 1) {
    const mins = Math.floor(diff / (1000 * 60))
    return `${mins} min`
  }
  return `${hours}h`
}

type Props = {
  item: ContractRequestItem
  isMutating: boolean
  onAccept: () => void
  onReject: () => void
  onCancel: () => void
  onChat: () => void
}

export function ProposalFooter({ item, isMutating, onAccept, onReject, onCancel, onChat }: Props) {
  const insets = useSafeAreaInsets()
  const bottomPad = Math.max(insets.bottom, 16)

  const { status, expiresAt, actions } = item
  const now = Date.now()

  const isExpired =
    status === 'EXPIRED' ||
    (status === 'PENDING_ACCEPTANCE' && !!expiresAt && new Date(expiresAt).getTime() <= now)

  const isPending = status === 'PENDING_ACCEPTANCE' && !isExpired
  const isAccepted = status === 'ACCEPTED'
  const isReadOnly =
    isExpired ||
    status === 'REJECTED' ||
    status === 'CANCELLED' ||
    status === 'COMPLETED' ||
    status === 'AWAITING_COMPLETION_CONFIRMATION' ||
    status === 'COMPLETION_DISPUTE'

  const canChat = actions?.canChat === true
  const expiryLabel = getExpiryLabel(expiresAt)

  function confirmReject() {
    Alert.alert(
      'Recusar oferta',
      'Tem certeza que deseja recusar esta oferta?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Recusar', style: 'destructive', onPress: onReject },
      ],
    )
  }

  function confirmCancel() {
    Alert.alert(
      'Desmarcar trabalho',
      'Tem certeza que deseja desmarcar este trabalho?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Desmarcar', style: 'destructive', onPress: onCancel },
      ],
    )
  }

  const footerStyle = [styles.footer, { paddingBottom: bottomPad }]

  if (isPending) {
    return (
      <View style={footerStyle}>
        <View style={styles.row}>
          <Pressable
            style={({ pressed }) => [styles.btn, styles.btnPrimary, pressed && styles.btnPressed, isMutating && styles.btnDisabled]}
            onPress={onAccept}
            disabled={isMutating}
          >
            <Text style={styles.btnPrimaryText}>{isMutating ? 'Aguarde...' : 'Aceitar'}</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.btnOutlineRed, pressed && styles.btnPressed, isMutating && styles.btnDisabled]}
            onPress={confirmReject}
            disabled={isMutating}
          >
            <Text style={styles.btnOutlineRedText}>Recusar</Text>
          </Pressable>
        </View>
        {expiryLabel ? (
          <View style={styles.expiryRow}>
            <Ionicons name="alert-circle-outline" size={12} color="#f59e0b" />
            <Text style={styles.expiryText}>Você tem até {expiryLabel} para responder</Text>
          </View>
        ) : null}
      </View>
    )
  }

  if (isAccepted) {
    return (
      <View style={footerStyle}>
        <View style={styles.row}>
          {canChat ? (
            <Pressable
              style={({ pressed }) => [styles.btn, styles.btnPrimary, pressed && styles.btnPressed, isMutating && styles.btnDisabled]}
              onPress={onChat}
              disabled={isMutating}
            >
              <Ionicons name="chatbubble-outline" size={16} color="#fff" />
              <Text style={styles.btnPrimaryText}>Mensagem</Text>
            </Pressable>
          ) : null}
          <Pressable
            style={({ pressed }) => [
              styles.btn,
              styles.btnOutlineRed,
              !canChat && styles.btnFull,
              pressed && styles.btnPressed,
              isMutating && styles.btnDisabled,
            ]}
            onPress={confirmCancel}
            disabled={isMutating}
          >
            <Text style={styles.btnOutlineRedText}>
              {isMutating ? 'Aguarde...' : 'Desmarcar trabalho'}
            </Text>
          </Pressable>
        </View>
      </View>
    )
  }

  if (isReadOnly) {
    const label =
      status === 'EXPIRED' || isExpired
        ? 'Oferta expirada'
        : status === 'AWAITING_COMPLETION_CONFIRMATION'
        ? 'Aguardando confirmação de conclusão'
        : status === 'COMPLETION_DISPUTE'
        ? 'Contratação em disputa'
        : status === 'COMPLETED'
        ? 'Contratação concluída'
        : 'Esta oferta foi encerrada'

    return (
      <View style={footerStyle}>
        <View style={styles.readOnlyRow}>
          <Ionicons name="time-outline" size={15} color="#94a3b8" />
          <Text style={styles.readOnlyText}>{label}</Text>
        </View>
      </View>
    )
  }

  return null
}

const styles = StyleSheet.create({
  footer: {
    backgroundColor: '#fff',
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(137,90,246,0.08)',
    paddingTop: 12,
    paddingHorizontal: 16,
    gap: 8,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  btn: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  btnFull: {
    flex: 1,
  },
  btnPrimary: {
    backgroundColor: '#895af6',
  },
  btnPrimaryText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
  btnOutlineRed: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: '#fecaca',
    backgroundColor: '#fef2f2',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  btnOutlineRedText: {
    color: '#ef4444',
    fontWeight: '700',
    fontSize: 14,
  },
  btnPressed: {
    opacity: 0.75,
  },
  btnDisabled: {
    opacity: 0.5,
  },
  expiryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
  expiryText: {
    fontSize: 11,
    color: '#94a3b8',
  },
  readOnlyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 6,
  },
  readOnlyText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#94a3b8',
  },
})

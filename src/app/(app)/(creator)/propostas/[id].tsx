import { useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { colors } from '@/theme/colors'
import {
  useConfirmCompletionMutation,
  useContractRequestDetailQuery,
  useContractReviewsQuery,
  useDisputeCompletionMutation,
  useSubmitReviewMutation,
} from '@/modules/contract-requests/queries'
import { formatAmount, formatDurationMinutes, formatShortDate } from '@/lib/formatters'

export default function ProposalDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()

  const { data: item, isLoading, isError } = useContractRequestDetailQuery(id)
  const reviewsQuery = useContractReviewsQuery(id, item?.status === 'COMPLETED')
  const alreadyReviewed = reviewsQuery.data?.reviews.some((r) => r.reviewerRole === 'CREATOR') ?? false

  const confirmMutation = useConfirmCompletionMutation()
  const disputeMutation = useDisputeCompletionMutation()
  const reviewMutation = useSubmitReviewMutation(id)

  const [showDisputeForm, setShowDisputeForm] = useState(false)
  const [disputeReason, setDisputeReason] = useState('')
  const [reviewRating, setReviewRating] = useState(0)
  const [reviewComment, setReviewComment] = useState('')
  const [reviewSubmitted, setReviewSubmitted] = useState(false)

  function handleConfirm() {
    Alert.alert(
      'Confirmar conclusão',
      'Confirmar que o serviço foi realizado conforme combinado?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          onPress: () => {
            confirmMutation.mutate(id, {
              onSuccess: () => Alert.alert('Pronto!', 'Conclusão confirmada com sucesso.'),
              onError: (err) =>
                Alert.alert('Erro', err instanceof Error ? err.message : 'Não foi possível confirmar.'),
            })
          },
        },
      ],
    )
  }

  function handleDispute() {
    if (!disputeReason.trim()) {
      Alert.alert('Atenção', 'Informe o motivo da disputa.')
      return
    }
    disputeMutation.mutate(
      { contractRequestId: id, reason: disputeReason.trim() },
      {
        onSuccess: () => {
          Alert.alert('Disputa aberta', 'Nossa equipe entrará em contato.')
          setShowDisputeForm(false)
          setDisputeReason('')
        },
        onError: (err) =>
          Alert.alert('Erro', err instanceof Error ? err.message : 'Não foi possível abrir disputa.'),
      },
    )
  }

  function handleSubmitReview() {
    if (reviewRating === 0) {
      Alert.alert('Atenção', 'Selecione uma nota de 1 a 5 estrelas.')
      return
    }
    const trimmedComment = reviewComment.trim()
    if (trimmedComment.length > 1000) {
      Alert.alert('Atenção', 'O comentário pode ter no máximo 1000 caracteres.')
      return
    }
    reviewMutation.mutate(
      { rating: reviewRating, comment: trimmedComment || undefined },
      {
        onSuccess: () => {
          setReviewSubmitted(true)
          Alert.alert('Obrigado!', 'Sua avaliação foi enviada.')
        },
        onError: (err) =>
          Alert.alert('Erro', err instanceof Error ? err.message : 'Não foi possível enviar avaliação.'),
      },
    )
  }

  if (isLoading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator color={colors.primary} />
      </SafeAreaView>
    )
  }

  if (isError || !item) {
    return (
      <SafeAreaView style={styles.center}>
        <Text style={styles.errorText}>Não foi possível carregar a contratação.</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>Voltar</Text>
        </TouchableOpacity>
      </SafeAreaView>
    )
  }

  const isAwaitingConfirmation = item.status === 'AWAITING_COMPLETION_CONFIRMATION'
  const isDisputed = item.status === 'COMPLETION_DISPUTE'
  const isCompleted = item.status === 'COMPLETED'
  const creatorAlreadyConfirmed = item.creatorConfirmedCompletedAt !== null
  const companyAlreadyConfirmed = item.companyConfirmedCompletedAt !== null

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.text.primary.light} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detalhe da oferta</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Info básica */}
        <View style={styles.card}>
          <Text style={styles.companyName}>{item.companyName ?? 'Empresa'}</Text>
          <Text style={styles.amount}>{formatAmount(item.pricing?.totalAmount ?? item.totalPrice)}</Text>
          {item.description ? (
            <View style={styles.descriptionBox}>
              <Text style={styles.descriptionText}>{item.description}</Text>
            </View>
          ) : null}
          <View style={styles.details}>
            <View style={styles.detailRow}>
              <Ionicons name="calendar-outline" size={14} color={colors.primary} />
              <Text style={styles.detailText}>
                {formatShortDate(item.startsAt)} · {new Date(item.startsAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Ionicons name="time-outline" size={14} color={colors.primary} />
              <Text style={styles.detailText}>{formatDurationMinutes(item.durationMinutes)}</Text>
            </View>
            <View style={styles.detailRow}>
              <Ionicons name="location-outline" size={14} color={colors.primary} />
              <Text style={styles.detailText}>{item.jobFormattedAddress ?? item.jobAddress}</Text>
            </View>
          </View>
        </View>

        {/* Awaiting confirmation section */}
        {isAwaitingConfirmation && (
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Ionicons name="time-outline" size={18} color="#d97706" />
              <Text style={styles.sectionTitle}>Aguardando confirmação de conclusão</Text>
            </View>
            <Text style={styles.sectionBody}>
              Confirme se o serviço foi realizado conforme combinado.
            </Text>

            {companyAlreadyConfirmed && (
              <View style={styles.confirmedRow}>
                <Ionicons name="checkmark-circle" size={16} color="#16a34a" />
                <Text style={styles.confirmedText}>A empresa já confirmou a conclusão.</Text>
              </View>
            )}

            {!creatorAlreadyConfirmed && (
              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={styles.confirmButton}
                  onPress={handleConfirm}
                  disabled={confirmMutation.isPending}
                >
                  <Text style={styles.confirmButtonText}>
                    {confirmMutation.isPending ? 'Confirmando...' : 'Marcar como concluído'}
                  </Text>
                </TouchableOpacity>

                {!showDisputeForm && (
                  <TouchableOpacity
                    style={styles.disputeLink}
                    onPress={() => setShowDisputeForm(true)}
                  >
                    <Text style={styles.disputeLinkText}>Reportar problema</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}

            {creatorAlreadyConfirmed && !companyAlreadyConfirmed && item.contestDeadlineAt && (
              <Text style={styles.deadlineText}>
                Se a empresa não confirmar até{' '}
                {new Date(item.contestDeadlineAt).toLocaleString('pt-BR')}, o contrato será concluído automaticamente.
              </Text>
            )}

            {showDisputeForm && (
              <View style={styles.disputeForm}>
                <Text style={styles.disputeLabel}>Descreva o problema</Text>
                <TextInput
                  style={styles.disputeInput}
                  placeholder="Informe o que aconteceu..."
                  multiline
                  numberOfLines={4}
                  maxLength={2000}
                  value={disputeReason}
                  onChangeText={setDisputeReason}
                />
                <View style={styles.disputeFormButtons}>
                  <TouchableOpacity
                    style={styles.disputeSubmitButton}
                    onPress={handleDispute}
                    disabled={disputeMutation.isPending}
                  >
                    <Text style={styles.disputeSubmitText}>
                      {disputeMutation.isPending ? 'Enviando...' : 'Abrir disputa'}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setShowDisputeForm(false)}>
                    <Text style={styles.disputeCancelText}>Cancelar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        )}

        {/* Disputed section */}
        {isDisputed && (
          <View style={[styles.sectionCard, styles.sectionCardRed]}>
            <View style={styles.sectionHeader}>
              <Ionicons name="alert-circle" size={18} color="#dc2626" />
              <Text style={[styles.sectionTitle, { color: '#dc2626' }]}>Em disputa de conclusão</Text>
            </View>
            {item.completionDisputeReason ? (
              <Text style={styles.sectionBody}>{item.completionDisputeReason}</Text>
            ) : null}
            <Text style={[styles.sectionBody, { marginTop: 4 }]}>
              Nossa equipe está analisando. Avaliações ficam bloqueadas até a resolução.
            </Text>
          </View>
        )}

        {/* Review section */}
        {isCompleted && !alreadyReviewed && !reviewSubmitted && (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Avaliar esta contratação</Text>
            <View style={styles.starsRow}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity key={star} onPress={() => setReviewRating(star)}>
                  <Ionicons
                    name={reviewRating >= star ? 'star' : 'star-outline'}
                    size={32}
                    color={reviewRating >= star ? '#f59e0b' : '#d1d5db'}
                  />
                </TouchableOpacity>
              ))}
            </View>
            <TextInput
              style={styles.reviewInput}
              placeholder="Comentário (opcional, máx. 1000 caracteres)"
              multiline
              numberOfLines={3}
              maxLength={1000}
              value={reviewComment}
              onChangeText={setReviewComment}
            />
            <Text style={styles.charCount}>{reviewComment.length}/1000</Text>
            <TouchableOpacity
              style={styles.reviewSubmitButton}
              onPress={handleSubmitReview}
              disabled={reviewMutation.isPending}
            >
              <Text style={styles.reviewSubmitText}>
                {reviewMutation.isPending ? 'Enviando...' : 'Enviar avaliação'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {(isCompleted && (alreadyReviewed || reviewSubmitted)) && (
          <View style={[styles.sectionCard, styles.sectionCardGreen]}>
            <Ionicons name="checkmark-circle" size={18} color="#16a34a" />
            <Text style={[styles.sectionBody, { color: '#15803d', marginTop: 4 }]}>
              Você já avaliou esta contratação.
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.light },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  errorText: { fontSize: 14, color: colors.text.secondary.light },
  backButton: { paddingHorizontal: 16, paddingVertical: 8, backgroundColor: colors.primary, borderRadius: 8 },
  backButtonText: { color: '#fff', fontWeight: '600' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
    backgroundColor: colors.surface.light,
  },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '700', color: colors.text.primary.light },
  scrollContent: { padding: 16, gap: 12 },
  card: {
    backgroundColor: colors.surface.light,
    borderRadius: 16,
    padding: 16,
    gap: 8,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  companyName: { fontSize: 18, fontWeight: '800', color: colors.text.primary.light },
  amount: { fontSize: 22, fontWeight: '800', color: '#6a36d5' },
  descriptionBox: { backgroundColor: '#f6f5f8', borderRadius: 10, padding: 10 },
  descriptionText: { fontSize: 13, color: colors.text.secondary.light, lineHeight: 20 },
  details: { gap: 6, marginTop: 4 },
  detailRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  detailText: { flex: 1, fontSize: 13, color: colors.text.secondary.light, lineHeight: 18 },
  sectionCard: {
    backgroundColor: '#fffbeb',
    borderRadius: 16,
    padding: 16,
    gap: 8,
    borderWidth: 1,
    borderColor: '#fde68a',
  },
  sectionCardRed: { backgroundColor: '#fef2f2', borderColor: '#fecaca' },
  sectionCardGreen: { backgroundColor: '#f0fdf4', borderColor: '#bbf7d0' },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#92400e', flex: 1 },
  sectionBody: { fontSize: 13, color: '#78350f', lineHeight: 20 },
  confirmedRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  confirmedText: { fontSize: 13, color: '#16a34a', fontWeight: '500' },
  actionButtons: { gap: 8 },
  confirmButton: {
    backgroundColor: '#6a36d5',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  confirmButtonText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  disputeLink: { alignItems: 'center', paddingVertical: 8 },
  disputeLinkText: { color: '#dc2626', fontSize: 13, fontWeight: '600' },
  deadlineText: { fontSize: 12, color: '#b45309', lineHeight: 18 },
  disputeForm: { gap: 8 },
  disputeLabel: { fontSize: 13, fontWeight: '600', color: '#374151' },
  disputeInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
    padding: 10,
    fontSize: 13,
    textAlignVertical: 'top',
    minHeight: 80,
  },
  disputeFormButtons: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  disputeSubmitButton: {
    backgroundColor: '#dc2626',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  disputeSubmitText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  disputeCancelText: { color: '#6b7280', fontSize: 13 },
  starsRow: { flexDirection: 'row', gap: 8, marginVertical: 4 },
  reviewInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
    padding: 10,
    fontSize: 13,
    textAlignVertical: 'top',
    minHeight: 72,
  },
  charCount: { fontSize: 11, color: '#9ca3af', textAlign: 'right' },
  reviewSubmitButton: {
    backgroundColor: '#6a36d5',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  reviewSubmitText: { color: '#fff', fontWeight: '700', fontSize: 15 },
})

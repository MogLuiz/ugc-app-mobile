import { useState } from 'react'
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import { useLocalSearchParams, useRouter } from 'expo-router'
import type { Href } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { colors } from '@/theme/colors'
import {
  useAcceptContractRequestMutation,
  useCancelContractRequestMutation,
  useConfirmCompletionMutation,
  useContractRequestDetailQuery,
  useContractReviewsQuery,
  useDisputeCompletionMutation,
  useRejectContractRequestMutation,
  useSubmitReviewMutation,
} from '@/modules/contract-requests/queries'
import { ProposalSkeleton } from '@/components/proposals/ProposalSkeleton'
import { CompanyHeader } from './_components/CompanyHeader'
import { InfoGrid } from './_components/InfoGrid'
import { BriefingSection } from './_components/BriefingSection'
import { PaymentSection } from './_components/PaymentSection'
import { LocationSection } from './_components/LocationSection'
import { ProposalFooter } from './_components/ProposalFooter'

// Bottom of footer (content + actions) — validated against real device; adjust if needed
const FOOTER_HEIGHT = 88

export default function ProposalDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const insets = useSafeAreaInsets()

  const { data: item, isLoading, isError, refetch } = useContractRequestDetailQuery(id)
  const reviewsQuery = useContractReviewsQuery(id, item?.status === 'COMPLETED')
  const alreadyReviewed =
    reviewsQuery.data?.reviews.some((r) => r.reviewerRole === 'CREATOR') ?? false

  // ── Mutations: existing (AWAITING / DISPUTE / REVIEW)
  const confirmMutation = useConfirmCompletionMutation()
  const disputeMutation = useDisputeCompletionMutation()
  const reviewMutation = useSubmitReviewMutation(id)

  // ── Mutations: new (PENDING_ACCEPTANCE / ACCEPTED)
  const acceptMutation = useAcceptContractRequestMutation()
  const rejectMutation = useRejectContractRequestMutation()
  const cancelMutation = useCancelContractRequestMutation()

  const isMutating =
    acceptMutation.isPending ||
    rejectMutation.isPending ||
    cancelMutation.isPending

  // ── Local state: dispute + review forms
  const [showDisputeForm, setShowDisputeForm] = useState(false)
  const [disputeReason, setDisputeReason] = useState('')
  const [reviewRating, setReviewRating] = useState(0)
  const [reviewComment, setReviewComment] = useState('')
  const [reviewSubmitted, setReviewSubmitted] = useState(false)

  // ── Navigation helper
  function navigateBackToList() {
    try {
      router.replace('/(creator)/propostas' as Href)
    } catch {
      router.back()
    }
  }

  // ── Handlers: accept / reject / cancel / chat
  function handleAccept() {
    acceptMutation.mutate(id, {
      onSuccess: navigateBackToList,
      onError: (err) =>
        Alert.alert('Erro', err instanceof Error ? err.message : 'Não foi possível aceitar a oferta.'),
    })
  }

  function handleReject() {
    rejectMutation.mutate(
      { contractRequestId: id },
      {
        onSuccess: navigateBackToList,
        onError: (err) =>
          Alert.alert('Erro', err instanceof Error ? err.message : 'Não foi possível recusar a oferta.'),
      },
    )
  }

  function handleCancel() {
    cancelMutation.mutate(id, {
      onSuccess: navigateBackToList,
      onError: (err) =>
        Alert.alert('Erro', err instanceof Error ? err.message : 'Não foi possível desmarcar o trabalho.'),
    })
  }

  function handleChat() {
    router.push({
      pathname: '/(creator)/mensagens',
      params: { contractRequestId: id },
    } as never)
  }

  // ── Handlers: confirm completion / dispute
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

  // ── Handler: review
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

  // ── Loading
  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color={colors.text.primary.light} />
          </Pressable>
          <Text style={styles.headerTitle}>Detalhe da oferta</Text>
          <View style={{ width: 40 }} />
        </View>
        <ProposalSkeleton />
      </SafeAreaView>
    )
  }

  // ── Error
  if (isError) {
    return (
      <SafeAreaView style={styles.center}>
        <Ionicons name="alert-circle-outline" size={40} color="#ef4444" />
        <Text style={styles.errorText}>Não foi possível carregar a oferta.</Text>
        <Pressable onPress={() => void refetch()} style={styles.retryButton}>
          <Text style={styles.retryButtonText}>Tentar novamente</Text>
        </Pressable>
        <Pressable onPress={() => router.back()} style={styles.backLinkBtn}>
          <Text style={styles.backLinkText}>Voltar</Text>
        </Pressable>
      </SafeAreaView>
    )
  }

  // ── Not found
  if (!item) {
    return (
      <SafeAreaView style={styles.center}>
        <Ionicons name="search-outline" size={40} color="#94a3b8" />
        <Text style={styles.errorText}>Oferta não encontrada.</Text>
        <Pressable onPress={() => router.back()} style={styles.retryButton}>
          <Text style={styles.retryButtonText}>Voltar</Text>
        </Pressable>
      </SafeAreaView>
    )
  }

  // ── Derived state for existing sections
  const isAwaitingConfirmation = item.status === 'AWAITING_COMPLETION_CONFIRMATION'
  const isDisputed = item.status === 'COMPLETION_DISPUTE'
  const isCompleted = item.status === 'COMPLETED'
  const creatorAlreadyConfirmed = item.creatorConfirmedCompletedAt !== null
  const companyAlreadyConfirmed = item.companyConfirmedCompletedAt !== null

  const scrollPaddingBottom = FOOTER_HEIGHT + insets.bottom

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.text.primary.light} />
        </Pressable>
        <Text style={styles.headerTitle}>Detalhe da oferta</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={[styles.scrollContent, { paddingBottom: scrollPaddingBottom }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Company identity */}
          <CompanyHeader
            companyName={item.companyName ?? 'Empresa'}
            companyLogoUrl={item.companyLogoUrl}
            companyRating={item.companyRating}
          />

          {/* Info grid */}
          <InfoGrid item={item} />

          {/* Briefing */}
          <BriefingSection description={item.description} />

          {/* Payment */}
          <PaymentSection item={item} />

          {/* Location */}
          <LocationSection item={item} />

          {/* ── AWAITING COMPLETION CONFIRMATION (unchanged) ── */}
          {isAwaitingConfirmation && (
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <Ionicons name="time-outline" size={18} color="#d97706" />
                <Text style={styles.sectionTitle}>Aguardando confirmação de conclusão</Text>
              </View>
              <Text style={styles.sectionBody}>
                Confirme se o serviço foi realizado conforme combinado.
              </Text>

              {companyAlreadyConfirmed ? (
                <View style={styles.confirmedRow}>
                  <Ionicons name="checkmark-circle" size={16} color="#16a34a" />
                  <Text style={styles.confirmedText}>A empresa já confirmou a conclusão.</Text>
                </View>
              ) : null}

              {!creatorAlreadyConfirmed ? (
                <View style={styles.actionButtons}>
                  <Pressable
                    style={({ pressed }) => [styles.confirmButton, pressed && { opacity: 0.8 }]}
                    onPress={handleConfirm}
                    disabled={confirmMutation.isPending}
                  >
                    <Text style={styles.confirmButtonText}>
                      {confirmMutation.isPending ? 'Confirmando...' : 'Marcar como concluído'}
                    </Text>
                  </Pressable>

                  {!showDisputeForm ? (
                    <Pressable
                      style={({ pressed }) => [styles.disputeLink, pressed && { opacity: 0.7 }]}
                      onPress={() => setShowDisputeForm(true)}
                    >
                      <Text style={styles.disputeLinkText}>Reportar problema</Text>
                    </Pressable>
                  ) : null}
                </View>
              ) : null}

              {creatorAlreadyConfirmed && !companyAlreadyConfirmed && item.contestDeadlineAt ? (
                <Text style={styles.deadlineText}>
                  Se a empresa não confirmar até{' '}
                  {new Date(item.contestDeadlineAt).toLocaleString('pt-BR')}, o contrato será
                  concluído automaticamente.
                </Text>
              ) : null}

              {showDisputeForm ? (
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
                    <Pressable
                      style={({ pressed }) => [styles.disputeSubmitButton, pressed && { opacity: 0.8 }]}
                      onPress={handleDispute}
                      disabled={disputeMutation.isPending}
                    >
                      <Text style={styles.disputeSubmitText}>
                        {disputeMutation.isPending ? 'Enviando...' : 'Abrir disputa'}
                      </Text>
                    </Pressable>
                    <Pressable onPress={() => setShowDisputeForm(false)}>
                      <Text style={styles.disputeCancelText}>Cancelar</Text>
                    </Pressable>
                  </View>
                </View>
              ) : null}
            </View>
          )}

          {/* ── COMPLETION DISPUTE (unchanged) ── */}
          {isDisputed ? (
            <View style={[styles.sectionCard, styles.sectionCardRed]}>
              <View style={styles.sectionHeader}>
                <Ionicons name="alert-circle" size={18} color="#dc2626" />
                <Text style={[styles.sectionTitle, { color: '#dc2626' }]}>
                  Em disputa de conclusão
                </Text>
              </View>
              {item.completionDisputeReason ? (
                <Text style={styles.sectionBody}>{item.completionDisputeReason}</Text>
              ) : null}
              <Text style={[styles.sectionBody, { marginTop: 4 }]}>
                Nossa equipe está analisando. Avaliações ficam bloqueadas até a resolução.
              </Text>
            </View>
          ) : null}

          {/* ── REVIEW (unchanged) ── */}
          {isCompleted && !alreadyReviewed && !reviewSubmitted ? (
            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Avaliar esta contratação</Text>
              <View style={styles.starsRow}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Pressable key={star} onPress={() => setReviewRating(star)}>
                    <Ionicons
                      name={reviewRating >= star ? 'star' : 'star-outline'}
                      size={32}
                      color={reviewRating >= star ? '#f59e0b' : '#d1d5db'}
                    />
                  </Pressable>
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
              <Pressable
                style={({ pressed }) => [styles.reviewSubmitButton, pressed && { opacity: 0.8 }]}
                onPress={handleSubmitReview}
                disabled={reviewMutation.isPending}
              >
                <Text style={styles.reviewSubmitText}>
                  {reviewMutation.isPending ? 'Enviando...' : 'Enviar avaliação'}
                </Text>
              </Pressable>
            </View>
          ) : null}

          {isCompleted && (alreadyReviewed || reviewSubmitted) ? (
            <View style={[styles.sectionCard, styles.sectionCardGreen]}>
              <Ionicons name="checkmark-circle" size={18} color="#16a34a" />
              <Text style={[styles.sectionBody, { color: '#15803d', marginTop: 4 }]}>
                Você já avaliou esta contratação.
              </Text>
            </View>
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Footer with contextual actions */}
      <ProposalFooter
        item={item}
        isMutating={isMutating}
        onAccept={handleAccept}
        onReject={handleReject}
        onCancel={handleCancel}
        onChat={handleChat}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.light },
  flex: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 24 },
  errorText: { fontSize: 15, color: colors.text.secondary.light, textAlign: 'center' },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: colors.primary,
    borderRadius: 20,
  },
  retryButtonText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  backLinkBtn: { paddingVertical: 8 },
  backLinkText: { color: colors.text.secondary.light, fontSize: 14 },
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
  // ── AWAITING COMPLETION ──
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
  // ── REVIEW ──
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

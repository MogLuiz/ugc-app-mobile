import { useEffect, useState } from 'react'
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useSubmitReviewMutation } from '@/modules/contract-requests/queries'
import { getInitials } from '@/lib/formatters'
import { colors } from '@/theme/colors'
import type { PendingActionVm } from '@/modules/creator-home/types'

type Props = {
  item: PendingActionVm | null
  visible: boolean
  onClose: () => void
  onSuccess: () => void
}

export function ReviewSheet({ item, visible, onClose, onSuccess }: Props) {
  const insets = useSafeAreaInsets()
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const reviewMutation = useSubmitReviewMutation(item?.id ?? '')

  // Reset form whenever the target item changes
  useEffect(() => {
    setRating(0)
    setComment('')
  }, [item?.id])

  function handleSubmit() {
    if (rating === 0) {
      Alert.alert('Atenção', 'Selecione uma nota de 1 a 5 estrelas.')
      return
    }
    if (comment.length > 1000) {
      Alert.alert('Atenção', 'O comentário pode ter no máximo 1000 caracteres.')
      return
    }
    reviewMutation.mutate(
      { rating, comment: comment.trim() || undefined },
      {
        onSuccess: () => {
          onSuccess()
          Alert.alert('Obrigado!', 'Sua avaliação foi enviada.')
        },
        onError: (err) =>
          Alert.alert(
            'Erro',
            err instanceof Error ? err.message : 'Não foi possível enviar a avaliação.',
          ),
      },
    )
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <Pressable style={styles.backdrop} onPress={onClose} />

        <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 24) }]}>
          {/* Handle + header */}
          <View style={styles.handleWrapper}>
            <View style={styles.handle} />
          </View>

          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>Avaliar empresa</Text>
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
                  {item.jobTypeName ? (
                    <Text style={styles.jobType} numberOfLines={1}>
                      {item.jobTypeName}
                    </Text>
                  ) : null}
                </View>
              </View>

              {/* Stars */}
              <View style={styles.starsRow}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Pressable key={star} onPress={() => setRating(star)} hitSlop={6}>
                    <Ionicons
                      name={rating >= star ? 'star' : 'star-outline'}
                      size={36}
                      color={rating >= star ? colors.warning : '#d1d5db'}
                    />
                  </Pressable>
                ))}
              </View>

              {/* Comment */}
              <View style={styles.commentWrapper}>
                <TextInput
                  style={styles.commentInput}
                  placeholder="Comentário (opcional)"
                  placeholderTextColor={colors.text.secondary.light}
                  multiline
                  numberOfLines={3}
                  maxLength={1000}
                  value={comment}
                  onChangeText={setComment}
                  textAlignVertical="top"
                />
                <Text style={styles.charCount}>{comment.length}/1000</Text>
              </View>

              {/* Submit */}
              <Pressable
                style={({ pressed }) => [
                  styles.submitButton,
                  rating === 0 && styles.submitButtonDisabled,
                  pressed && rating > 0 && styles.submitButtonPressed,
                ]}
                onPress={handleSubmit}
                disabled={rating === 0 || reviewMutation.isPending}
              >
                <Text style={styles.submitButtonText}>
                  {reviewMutation.isPending ? 'Enviando…' : 'Enviar avaliação'}
                </Text>
              </Pressable>
            </View>
          ) : null}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
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
    gap: 20,
  },
  identityRow: {
    flexDirection: 'row',
    alignItems: 'center',
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
  identityText: { flex: 1, gap: 2 },
  companyName: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text.primary.light,
    letterSpacing: -0.1,
  },
  jobType: {
    fontSize: 13,
    color: colors.text.secondary.light,
  },
  starsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
  },
  commentWrapper: { gap: 4 },
  commentInput: {
    borderWidth: 1,
    borderColor: colors.border.light,
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    color: colors.text.primary.light,
    minHeight: 80,
    backgroundColor: '#fafafa',
  },
  charCount: {
    fontSize: 11,
    color: colors.text.secondary.light,
    textAlign: 'right',
  },
  submitButton: {
    backgroundColor: colors.primary,
    borderRadius: 999,
    paddingVertical: 14,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.45,
  },
  submitButtonPressed: {
    opacity: 0.85,
  },
  submitButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },
})

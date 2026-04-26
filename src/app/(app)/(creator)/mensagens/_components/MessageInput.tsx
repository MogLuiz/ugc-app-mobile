import { useRef, useState } from 'react'
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { colors } from '@/theme/colors'

const INPUT_MIN_HEIGHT = 46
const INPUT_MAX_HEIGHT = 120

type Props = {
  onSend: (content: string) => void
  onRetryLastFailed?: () => void
  isSending: boolean
  errorMessage: string | null
  disabled?: boolean
}

export function MessageInput({ onSend, onRetryLastFailed, isSending, errorMessage, disabled }: Props) {
  const [content, setContent] = useState('')
  const [inputHeight, setInputHeight] = useState(INPUT_MIN_HEIGHT)
  const inputRef = useRef<TextInput>(null)

  const trimmed = content.trim()
  const canSend = Boolean(trimmed) && !disabled && !isSending

  function handleSend() {
    if (!canSend) return
    onSend(trimmed)
    setContent('')
    setInputHeight(INPUT_MIN_HEIGHT)
  }

  return (
    <View style={styles.container}>
      {errorMessage ? (
        <View style={styles.errorBar}>
          <Text style={styles.errorText} numberOfLines={1}>
            {errorMessage}
          </Text>
          {onRetryLastFailed ? (
            <Pressable
              onPress={onRetryLastFailed}
              style={styles.retryButton}
              accessibilityRole="button"
              accessibilityLabel="Reenviar mensagem"
            >
              <Text style={styles.retryText}>Reenviar</Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}

      <View style={styles.row}>
        <TextInput
          ref={inputRef}
          value={content}
          onChangeText={setContent}
          placeholder="Escreva sua mensagem..."
          placeholderTextColor="#94a3b8"
          multiline
          maxLength={2000}
          editable={!disabled}
          onContentSizeChange={(e) => {
            const h = e.nativeEvent.contentSize.height
            setInputHeight(Math.min(Math.max(INPUT_MIN_HEIGHT, h), INPUT_MAX_HEIGHT))
          }}
          style={[styles.input, { height: inputHeight }]}
          returnKeyType="default"
          blurOnSubmit={false}
        />

        <Pressable
          onPress={handleSend}
          disabled={!canSend}
          style={({ pressed }) => [
            styles.sendButton,
            !canSend && styles.sendButtonDisabled,
            pressed && canSend && styles.sendButtonPressed,
          ]}
          accessibilityRole="button"
          accessibilityLabel={isSending ? 'Enviando mensagem' : 'Enviar mensagem'}
        >
          {isSending ? (
            <ActivityIndicator size={16} color="#fff" />
          ) : (
            <Ionicons name="send" size={16} color="#fff" />
          )}
        </Pressable>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border.light,
    paddingHorizontal: 12,
    paddingTop: 10,
    gap: 8,
    backgroundColor: colors.surface.light,
  },
  errorBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
    borderRadius: 12,
    borderCurve: 'continuous',
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  } as object,
  errorText: {
    flex: 1,
    fontSize: 12,
    color: '#b91c1c',
  },
  retryButton: {
    borderWidth: 1,
    borderColor: '#fca5a5',
    borderRadius: 100,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  retryText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#b91c1c',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    paddingBottom: 8,
  },
  input: {
    flex: 1,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: colors.border.light,
    borderRadius: 22,
    borderCurve: 'continuous',
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 12,
    fontSize: 14,
    color: colors.text.primary.light,
    lineHeight: 20,
  } as object,
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 8px 16px -8px rgba(137,90,246,0.7)',
  } as object,
  sendButtonDisabled: {
    backgroundColor: '#cbd5e1',
    boxShadow: 'none',
  } as object,
  sendButtonPressed: {
    opacity: 0.85,
  },
})

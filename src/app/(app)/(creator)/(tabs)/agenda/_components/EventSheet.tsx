import { useEffect, useRef } from 'react'
import type { ReactNode } from 'react'
import {
  Animated,
  Image,
  Linking,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import {
  getMobileCardDescriptionTitle,
  getMobilePinLineText,
} from '@/modules/creator-calendar/lib/calendar-display'
import { VISUAL_STATUS_BADGE_LABEL } from '@/modules/creator-calendar/lib/calendar-view-model'
import { formatTimeInTimeZone } from '@/modules/creator-calendar/lib/calendar-tz'
import type { UiCalendarEvent, VisualCalendarStatus } from '@/modules/creator-calendar/types'
import { colors } from '@/theme/colors'

type StatusStyle = { bg: string; text: string }

const STATUS_STYLE: Record<VisualCalendarStatus, StatusStyle> = {
  confirmed: { bg: '#d1fae5', text: '#065f46' },
  pending: { bg: '#fef3c7', text: '#92400e' },
  completed: { bg: '#f1f5f9', text: '#475569' },
  cancelled: { bg: '#fee2e2', text: '#991b1b' },
}

function SectionTitle({ children }: { children: string }) {
  return <Text style={headerStyles.sectionTitle}>{children}</Text>
}

const headerStyles = StyleSheet.create({
  sectionTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
})

function InfoCard({ children }: { children: ReactNode }) {
  return <View style={infoCardStyles.card}>{children}</View>
}

const infoCardStyles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border.light,
    padding: 14,
    gap: 8,
  },
})

function ActionButton({
  label,
  icon,
  variant,
  loading,
  onPress,
}: {
  label: string
  icon: string
  variant: 'primary' | 'outline'
  loading?: boolean
  onPress: () => void
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={loading}
      style={({ pressed }) => [
        actionStyles.btn,
        variant === 'primary' ? actionStyles.btnPrimary : actionStyles.btnOutline,
        pressed && actionStyles.btnPressed,
        loading && actionStyles.btnDisabled,
      ]}
      accessibilityRole="button"
    >
      <Ionicons
        name={icon as never}
        size={16}
        color={variant === 'primary' ? '#fff' : colors.primary}
      />
      <Text
        style={[
          actionStyles.btnText,
          variant === 'primary' ? actionStyles.btnTextPrimary : actionStyles.btnTextOutline,
        ]}
      >
        {loading ? 'Aguarde...' : label}
      </Text>
    </Pressable>
  )
}

const actionStyles = StyleSheet.create({
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 100,
  },
  btnPrimary: {
    backgroundColor: colors.primary,
  },
  btnOutline: {
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  btnPressed: {
    opacity: 0.8,
  },
  btnDisabled: {
    opacity: 0.5,
  },
  btnText: {
    fontSize: 14,
    fontWeight: '700',
  },
  btnTextPrimary: {
    color: '#fff',
  },
  btnTextOutline: {
    color: colors.primary,
  },
})

type EventSheetProps = {
  event: UiCalendarEvent | null
  isOpen: boolean
  timeZone: string
  isAccepting: boolean
  onClose: () => void
  onAccept: (bookingId: string) => void
  onOpenProposal: (contractRequestId: string) => void
  onOpenChat: (contractRequestId: string) => void
}

export function EventSheet({
  event,
  isOpen,
  timeZone,
  isAccepting,
  onClose,
  onAccept,
  onOpenProposal,
  onOpenChat,
}: EventSheetProps) {
  const insets = useSafeAreaInsets()
  const slideAnim = useRef(new Animated.Value(600)).current

  useEffect(() => {
    if (isOpen && event) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        damping: 28,
        stiffness: 280,
      }).start()
    } else {
      Animated.timing(slideAnim, {
        toValue: 600,
        duration: 180,
        useNativeDriver: true,
      }).start()
    }
  }, [isOpen, event])

  if (!event && !isOpen) return null

  const tone = event ? STATUS_STYLE[event.visualStatus] : STATUS_STYLE.pending
  const descTitle = event ? getMobileCardDescriptionTitle(event) : ''
  const pinText = event ? getMobilePinLineText(event) : ''
  const addressLine = event ? (event.locationLine?.trim() || event.modeLine) : ''
  const endedInPast = event ? event.endAt.getTime() < Date.now() : false

  const canAccept =
    event?.origin === 'BOOKING' &&
    event?.bookingStatus === 'PENDING' &&
    !endedInPast

  const canChat =
    event?.origin === 'CONTRACT_REQUEST' &&
    Boolean(event?.contractRequestId)

  const canSeeProposal = Boolean(event?.contractRequestId)

  const showMapCta =
    event && Boolean(event.locationLine?.trim()) && event.mode !== 'REMOTE'

  function openMaps() {
    if (!showMapCta || !event?.locationLine) return
    void Linking.openURL(
      `https://maps.google.com/?q=${encodeURIComponent(event.locationLine.trim())}`,
    )
  }

  const startWeekday = event
    ? new Intl.DateTimeFormat('pt-BR', {
        timeZone,
        weekday: 'short',
      })
        .format(event.startAt)
        .replace('.', '')
        .trim()
        .toUpperCase()
    : ''

  const startDateLabel = event
    ? new Intl.DateTimeFormat('pt-BR', {
        timeZone,
        day: 'numeric',
        month: 'long',
      }).format(event.startAt)
    : ''

  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={sheetStyles.overlay}>
        <Pressable style={sheetStyles.backdrop} onPress={onClose} />

        <Animated.View
          style={[
            sheetStyles.sheet,
            { paddingBottom: insets.bottom + 16 },
            { transform: [{ translateY: slideAnim }] },
          ]}
        >
          <View style={sheetStyles.handle} />

          <View style={sheetStyles.sheetHeader}>
            <Text style={sheetStyles.sheetTitle}>Compromisso</Text>
            <Pressable
              onPress={onClose}
              style={({ pressed }) => [sheetStyles.closeBtn, pressed && sheetStyles.closeBtnPressed]}
              accessibilityLabel="Fechar"
              hitSlop={8}
            >
              <Ionicons name="close" size={20} color="#64748b" />
            </Pressable>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={sheetStyles.scrollContent}
          >
            {event ? (
              <>
                {endedInPast ? (
                  <View style={sheetStyles.pastNotice}>
                    <Text style={sheetStyles.pastNoticeText}>
                      Este compromisso já ocorreu — o horário exibido está no passado.
                    </Text>
                  </View>
                ) : null}

                {/* Header do evento */}
                <View style={sheetStyles.eventHeader}>
                  <View style={[sheetStyles.statusPill, { backgroundColor: tone.bg }]}>
                    <Text style={[sheetStyles.statusPillText, { color: tone.text }]}>
                      {VISUAL_STATUS_BADGE_LABEL[event.visualStatus]}
                    </Text>
                  </View>
                  <View style={sheetStyles.companyRow}>
                    <View style={sheetStyles.companyAvatar}>
                      {event.companyPhotoUrl ? (
                        <Image
                          source={{ uri: event.companyPhotoUrl }}
                          style={sheetStyles.companyAvatarImg}
                        />
                      ) : (
                        <Text style={sheetStyles.companyInitial}>
                          {event.company.charAt(0).toUpperCase()}
                        </Text>
                      )}
                    </View>
                    <View style={sheetStyles.companyInfo}>
                      <Text style={sheetStyles.companyName} numberOfLines={1}>
                        {event.company}
                      </Text>
                      <Text style={sheetStyles.jobKind}>{event.jobKindLabel}</Text>
                    </View>
                  </View>
                  <Text style={sheetStyles.jobTitle}>{descTitle}</Text>
                </View>

                {/* Horário */}
                <View style={sheetStyles.section}>
                  <SectionTitle>Horário</SectionTitle>
                  <InfoCard>
                    <View style={sheetStyles.infoRow}>
                      <Text style={sheetStyles.infoEmoji}>📅</Text>
                      <Text style={sheetStyles.infoText}>
                        {startWeekday} · {startDateLabel}
                      </Text>
                    </View>
                    <View style={sheetStyles.infoRow}>
                      <Text style={sheetStyles.infoEmoji}>🕒</Text>
                      <Text style={sheetStyles.infoText}>
                        {formatTimeInTimeZone(event.startAt, timeZone)} — {formatTimeInTimeZone(event.endAt, timeZone)}
                      </Text>
                    </View>
                    <View style={sheetStyles.infoRow}>
                      <Text style={sheetStyles.infoEmoji}>⏱</Text>
                      <Text style={sheetStyles.infoText}>{event.durationLabel}</Text>
                    </View>
                  </InfoCard>
                </View>

                {/* Local */}
                <View style={sheetStyles.section}>
                  <SectionTitle>Local</SectionTitle>
                  <InfoCard>
                    <View style={sheetStyles.infoRow}>
                      <Ionicons name="location-outline" size={16} color="#94a3b8" />
                      <Text style={[sheetStyles.infoText, { flex: 1 }]}>{addressLine}</Text>
                    </View>
                    {pinText && pinText !== addressLine ? (
                      <View style={sheetStyles.infoRow}>
                        <Ionicons name="navigate-outline" size={16} color="#94a3b8" />
                        <Text style={[sheetStyles.infoText, { flex: 1 }]}>{pinText}</Text>
                      </View>
                    ) : null}
                    {event.distanceLabel ? (
                      <Text style={sheetStyles.distanceText}>{event.distanceLabel}</Text>
                    ) : null}
                  </InfoCard>
                </View>

                {/* Empresa */}
                {event.companyRating != null ? (
                  <View style={sheetStyles.section}>
                    <SectionTitle>Empresa</SectionTitle>
                    <InfoCard>
                      <View style={sheetStyles.infoRow}>
                        <Ionicons name="star" size={14} color="#f59e0b" />
                        <Text style={sheetStyles.infoText}>{event.companyRating.toFixed(1)}</Text>
                      </View>
                    </InfoCard>
                  </View>
                ) : null}

                {/* Descrição */}
                {event.description ? (
                  <View style={sheetStyles.section}>
                    <SectionTitle>Descrição</SectionTitle>
                    <Text style={sheetStyles.bodyText}>{event.description}</Text>
                  </View>
                ) : null}

                {/* Notas */}
                {event.notes ? (
                  <View style={sheetStyles.section}>
                    <SectionTitle>Notas</SectionTitle>
                    <Text style={sheetStyles.bodyText}>{event.notes}</Text>
                  </View>
                ) : null}

                {/* Ações */}
                <View style={sheetStyles.section}>
                  <SectionTitle>Ações</SectionTitle>
                  <View style={sheetStyles.actions}>
                    {canAccept ? (
                      <ActionButton
                        label="Confirmar presença"
                        icon="checkmark-circle-outline"
                        variant="primary"
                        loading={isAccepting}
                        onPress={() => onAccept(event.id)}
                      />
                    ) : null}
                    {canChat && event.contractRequestId ? (
                      <ActionButton
                        label="Abrir conversa"
                        icon="chatbubble-outline"
                        variant="outline"
                        onPress={() => onOpenChat(event.contractRequestId!)}
                      />
                    ) : null}
                    {canSeeProposal && event.contractRequestId ? (
                      <ActionButton
                        label="Ver campanha completa"
                        icon="document-text-outline"
                        variant="outline"
                        onPress={() => onOpenProposal(event.contractRequestId!)}
                      />
                    ) : null}
                    {showMapCta ? (
                      <ActionButton
                        label="Abrir no Maps"
                        icon="map-outline"
                        variant="outline"
                        onPress={openMaps}
                      />
                    ) : null}
                  </View>
                </View>
              </>
            ) : null}
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  )
}

const sheetStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(15,23,42,0.4)',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  sheet: {
    backgroundColor: '#fafafa',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 24,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#e2e8f0',
    marginTop: 12,
    marginBottom: 4,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  sheetTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text.primary.light,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnPressed: {
    backgroundColor: '#e2e8f0',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 8,
    gap: 20,
  },
  pastNotice: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border.light,
    padding: 12,
  },
  pastNoticeText: {
    fontSize: 13,
    color: colors.text.secondary.light,
    lineHeight: 18,
  },
  eventHeader: {
    gap: 12,
  },
  statusPill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 100,
  },
  statusPillText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  companyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  companyAvatar: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    flexShrink: 0,
  },
  companyAvatarImg: {
    width: 44,
    height: 44,
  },
  companyInitial: {
    fontSize: 18,
    fontWeight: '700',
    color: '#475569',
  },
  companyInfo: {
    flex: 1,
    gap: 2,
  },
  companyName: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text.primary.light,
    letterSpacing: -0.4,
  },
  jobKind: {
    fontSize: 13,
    color: colors.text.secondary.light,
    fontWeight: '500',
  },
  jobTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text.primary.light,
    lineHeight: 22,
  },
  section: {
    gap: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  infoEmoji: {
    fontSize: 14,
    lineHeight: 20,
  },
  infoText: {
    fontSize: 14,
    color: colors.text.primary.light,
    lineHeight: 20,
    fontWeight: '500',
  },
  distanceText: {
    fontSize: 13,
    color: colors.text.secondary.light,
    marginTop: 2,
  },
  bodyText: {
    fontSize: 14,
    color: colors.text.secondary.light,
    lineHeight: 22,
  },
  actions: {
    gap: 10,
  },
})

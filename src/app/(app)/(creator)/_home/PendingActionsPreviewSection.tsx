import { Pressable, StyleSheet, Text, View } from 'react-native'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { getInitials } from '@/lib/formatters'
import { colors } from '@/theme/colors'
import type { PendingActionVm } from '@/modules/creator-home/types'

function Avatar({ name }: { name: string }) {
  return (
    <View style={styles.avatar}>
      <Text style={styles.avatarText}>{getInitials(name)}</Text>
    </View>
  )
}

function ConfirmCard({
  item,
  onConfirm,
}: {
  item: PendingActionVm
  onConfirm: (item: PendingActionVm) => void
}) {
  return (
    <View style={styles.card}>
      <View style={styles.cardBody}>
        <Avatar name={item.companyName} />
        <View style={styles.cardText}>
          <Text style={styles.companyName} numberOfLines={1}>
            {item.companyName}
          </Text>
          <Text style={styles.title} numberOfLines={1}>
            {item.title}
          </Text>
          {item.dateLabel ? <Text style={styles.dateLabel}>{item.dateLabel}</Text> : null}
        </View>
      </View>
      <View style={styles.confirmFooter}>
        <Pressable
          style={({ pressed }) => [styles.confirmButton, pressed && styles.buttonPressed]}
          onPress={() => onConfirm(item)}
        >
          <Ionicons name="checkmark-circle-outline" size={14} color="#fff" />
          <Text style={styles.confirmButtonText}>Confirmar realização</Text>
        </Pressable>
      </View>
    </View>
  )
}

function ReviewCard({
  item,
  onReview,
}: {
  item: PendingActionVm
  onReview: (item: PendingActionVm) => void
}) {
  return (
    <View style={styles.card}>
      <View style={styles.cardBody}>
        <Avatar name={item.companyName} />
        <View style={styles.cardText}>
          <Text style={styles.companyName} numberOfLines={1}>
            {item.companyName}
          </Text>
          <Text style={styles.title} numberOfLines={1}>
            {item.title}
          </Text>
          {item.dateLabel ? <Text style={styles.dateLabel}>{item.dateLabel}</Text> : null}
        </View>
        <Pressable
          style={({ pressed }) => [styles.reviewPill, pressed && styles.buttonPressed]}
          onPress={() => onReview(item)}
          hitSlop={8}
        >
          <Ionicons name="star-outline" size={11} color={colors.primary} />
          <Text style={styles.reviewPillText}>Avaliar</Text>
        </Pressable>
      </View>
    </View>
  )
}

export function PendingActionsPreviewSection({
  items,
  hasOverflow,
  onConfirm,
  onReview,
}: {
  items: PendingActionVm[]
  hasOverflow: boolean
  onConfirm: (item: PendingActionVm) => void
  onReview: (item: PendingActionVm) => void
}) {
  const router = useRouter()

  if (items.length === 0) return null

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleBlock}>
          <Text style={styles.sectionTitle}>Ações pendentes</Text>
          <Text style={styles.sectionDescription}>
            Confirmações e avaliações que precisam da sua atenção.
          </Text>
        </View>
        {hasOverflow ? (
          <Pressable onPress={() => router.push('/(creator)/propostas' as never)}>
            <Text style={styles.sectionCta}>Ver todas</Text>
          </Pressable>
        ) : null}
      </View>

      <View style={styles.list}>
        {items.map((item) =>
          item.kind === 'confirm_completion' ? (
            <ConfirmCard key={item.id} item={item} onConfirm={onConfirm} />
          ) : (
            <ReviewCard key={item.id} item={item} onReview={onReview} />
          ),
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  section: { gap: 10 },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
  },
  sectionTitleBlock: { flex: 1, gap: 2 },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text.primary.light,
    letterSpacing: -0.2,
  },
  sectionDescription: {
    fontSize: 12,
    color: colors.text.secondary.light,
  },
  sectionCta: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
    paddingTop: 2,
  },
  list: { gap: 10 },
  card: {
    backgroundColor: colors.surface.light,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border.light,
    overflow: 'hidden',
  },
  cardBody: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ede9fb',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  avatarText: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.primary,
  },
  cardText: {
    flex: 1,
    gap: 2,
  },
  companyName: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text.primary.light,
    letterSpacing: -0.1,
  },
  title: {
    fontSize: 12,
    color: colors.text.secondary.light,
  },
  dateLabel: {
    fontSize: 11,
    color: colors.text.secondary.light,
    opacity: 0.75,
    marginTop: 1,
  },
  // Confirm card footer
  confirmFooter: {
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  confirmButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: colors.primary,
    borderRadius: 999,
    paddingVertical: 10,
  },
  confirmButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#fff',
  },
  // Review card pill
  reviewPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 5,
    flexShrink: 0,
  },
  reviewPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
  buttonPressed: { opacity: 0.85 },
})

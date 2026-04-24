import { Pressable, StyleSheet, Text, View } from 'react-native'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { getInitials } from '@/lib/formatters'
import { colors } from '@/theme/colors'
import type { CreatorHubItem } from '@/modules/contract-requests/creator-hub.types'

function getCompletedLabel(finalizedAt: string | null): string {
  if (!finalizedAt) return 'Trabalho concluído'
  const d = new Date(finalizedAt)
  return `Concluído em ${d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}`
}

function PendingReviewCard({ item }: { item: CreatorHubItem }) {
  const router = useRouter()

  return (
    <View style={styles.card}>
      <View style={styles.cardContent}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{getInitials(item.company.name)}</Text>
        </View>
        <View style={styles.cardBody}>
          <Text style={styles.companyName} numberOfLines={1}>
            {item.company.name}
          </Text>
          <Text style={styles.campaignTitle} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={styles.completedLabel}>{getCompletedLabel(item.finalizedAt)}</Text>
        </View>
      </View>
      <Pressable
        style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
        onPress={() => router.push(`/(creator)/propostas/${item.id}` as never)}
      >
        <Ionicons name="star" size={13} color="#fff" />
        <Text style={styles.buttonText}>Avaliar empresa</Text>
      </Pressable>
    </View>
  )
}

export function PendingReviewsPreviewSection({
  items,
  hasOverflow,
}: {
  items: CreatorHubItem[]
  hasOverflow: boolean
}) {
  const router = useRouter()

  if (items.length === 0) return null

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleBlock}>
          <Text style={styles.sectionTitle}>Avaliações pendentes</Text>
          <Text style={styles.sectionDescription}>
            Contratos concluídos aguardando sua avaliação.
          </Text>
        </View>
        {hasOverflow ? (
          <Pressable onPress={() => router.push('/(creator)/propostas' as never)}>
            <Text style={styles.sectionCta}>Ver todas</Text>
          </Pressable>
        ) : null}
      </View>

      <View style={styles.list}>
        {items.map((item) => (
          <PendingReviewCard key={item.id} item={item} />
        ))}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  section: {
    gap: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
  },
  sectionTitleBlock: {
    flex: 1,
    gap: 2,
  },
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
  list: {
    gap: 12,
  },
  card: {
    backgroundColor: colors.surface.light,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border.light,
    overflow: 'hidden',
    padding: 14,
    gap: 14,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ede9fb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.primary,
  },
  cardBody: {
    flex: 1,
    gap: 2,
  },
  companyName: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text.primary.light,
    letterSpacing: -0.1,
  },
  campaignTitle: {
    fontSize: 12,
    color: colors.text.secondary.light,
  },
  completedLabel: {
    fontSize: 11,
    color: colors.text.secondary.light,
    opacity: 0.7,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderRadius: 999,
    backgroundColor: colors.warning,
    paddingVertical: 11,
    paddingHorizontal: 14,
  },
  buttonPressed: {
    opacity: 0.85,
  },
  buttonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#fff',
  },
})

import { StyleSheet, Text, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import type { CreatorHubItem } from '@/modules/contract-requests/creator-hub.types'
import { colors } from '@/theme/colors'
import { CreatorHubCard } from './CreatorHubCard'

function SubsectionHeader({ label, count }: { label: string; count: number }) {
  return (
    <Text style={styles.subsectionHeader}>
      {label} ({count})
    </Text>
  )
}

function EmptyState() {
  return (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconWrap}>
        <Ionicons name="pricetag-outline" size={22} color="#c4b5fd" />
      </View>
      <Text style={styles.emptyTitle}>Nenhuma oferta por enquanto</Text>
      <Text style={styles.emptyDescription}>
        Convites de trabalho e candidaturas enviadas aparecerão aqui.
      </Text>
    </View>
  )
}

export function PendingTabContent({
  invites,
  applications,
  onAccept,
  onReject,
}: {
  invites: CreatorHubItem[]
  applications: CreatorHubItem[]
  onAccept: (id: string) => void
  onReject: (id: string) => void
}) {
  const hasInvites = invites.length > 0
  const hasApplications = applications.length > 0

  if (!hasInvites && !hasApplications) {
    return <EmptyState />
  }

  return (
    <View style={styles.container}>
      {hasInvites && (
        <View style={styles.section}>
          <SubsectionHeader label="Convites" count={invites.length} />
          <View style={styles.list}>
            {invites.map((item) => (
              <CreatorHubCard
                key={item.id}
                item={item}
                onAccept={onAccept}
                onReject={onReject}
              />
            ))}
          </View>
        </View>
      )}

      {hasApplications && (
        <View style={styles.section}>
          <SubsectionHeader label="Candidaturas enviadas" count={applications.length} />
          <View style={styles.list}>
            {applications.map((item) => (
              <CreatorHubCard key={item.id} item={item} />
            ))}
          </View>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    gap: 24,
  },
  section: {
    gap: 10,
  },
  subsectionHeader: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.text.secondary.light,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  list: {
    gap: 12,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    paddingHorizontal: 32,
    gap: 0,
  },
  emptyIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#f5f3ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text.primary.light,
    textAlign: 'center',
    letterSpacing: -0.2,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 13,
    color: colors.text.secondary.light,
    textAlign: 'center',
    lineHeight: 20,
  },
})

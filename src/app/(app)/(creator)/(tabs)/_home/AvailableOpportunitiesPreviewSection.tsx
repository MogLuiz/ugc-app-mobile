import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { MobileEmptyState } from '@/components/MobileEmptyState'
import { colors } from '@/theme/colors'
import {
  isAddressRequiredError,
  selectDisplayableOpenOpportunities,
} from '@/modules/opportunities/helpers'
import { useOpportunityPreviewQuery } from '@/modules/opportunities/queries'
import { OpportunityCard } from '@/modules/opportunities/components/OpportunityCard'
import { HomeSectionSkeleton } from './HomeSectionSkeleton'

function EmptyIllustration() {
  return (
    <View style={styles.iconBubble}>
      <Ionicons name="compass-outline" size={16} color="#6a36d5" />
    </View>
  )
}

function AddressIllustration() {
  return (
    <View style={styles.iconBubble}>
      <Ionicons name="location-outline" size={16} color="#6a36d5" />
    </View>
  )
}

export function AvailableOpportunitiesPreviewSection() {
  const router = useRouter()
  const query = useOpportunityPreviewQuery(2)

  const items = selectDisplayableOpenOpportunities(query.data?.items ?? [])
  const hasItems = items.length > 0
  const hasAddressError = isAddressRequiredError(query.error)
  const shouldShowError = !hasAddressError && Boolean(query.error) && !hasItems

  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <Text style={styles.title}>Oportunidades disponíveis</Text>
        {hasItems ? (
          <Pressable onPress={() => router.push('/(creator)/oportunidades' as never)}>
            <Text style={styles.cta}>Ver todas</Text>
          </Pressable>
        ) : null}
      </View>

      {query.isLoading ? <HomeSectionSkeleton rows={2} /> : null}

      {!query.isLoading && hasAddressError ? (
        <View style={styles.card}>
          <MobileEmptyState
            compact
            icon={<AddressIllustration />}
            title="Adicione seu endereço para ver oportunidades"
            description="Complete seu perfil para visualizar vagas perto de você."
            actions={
              <View style={styles.centeredActions}>
                <Pressable
                  style={({ pressed }) => [styles.outlineButton, pressed && styles.buttonPressed]}
                  onPress={() => router.push('/(creator)/perfil' as never)}
                >
                  <Text style={styles.outlineButtonText}>Completar perfil</Text>
                </Pressable>
              </View>
            }
          />
        </View>
      ) : null}

      {!query.isLoading && shouldShowError ? (
        <View style={styles.card}>
          <MobileEmptyState
            compact
            icon={<EmptyIllustration />}
            title="Não foi possível carregar"
            description="Tente novamente em instantes."
            actions={
              <View style={styles.centeredActions}>
                <Pressable
                  style={({ pressed }) => [styles.outlineButton, pressed && styles.buttonPressed]}
                  onPress={() => void query.refetch()}
                >
                  <Text style={styles.outlineButtonText}>Tentar novamente</Text>
                </Pressable>
              </View>
            }
          />
        </View>
      ) : null}

      {!query.isLoading && !hasAddressError && !query.error && !hasItems ? (
        <View style={styles.card}>
          <MobileEmptyState
            compact
            icon={<EmptyIllustration />}
            title="Nenhuma vaga no momento"
            description="Quando empresas abrirem vagas você verá aqui."
            actions={
              <View style={styles.centeredActions}>
                <Pressable
                  style={({ pressed }) => [styles.outlineButton, pressed && styles.buttonPressed]}
                  onPress={() => router.push('/(creator)/oportunidades' as never)}
                >
                  <Text style={styles.outlineButtonText}>Ver oportunidades</Text>
                </Pressable>
              </View>
            }
          />
        </View>
      ) : null}

      {!query.isLoading && hasItems ? (
        <View style={styles.list}>
          {items.map((item) => (
            <OpportunityCard key={item.id} item={item} />
          ))}
        </View>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  section: {
    gap: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text.primary.light,
    letterSpacing: -0.2,
  },
  cta: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
  },
  list: {
    gap: 12,
  },
  card: {
    backgroundColor: colors.surface.light,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border.light,
    paddingHorizontal: 12,
  },
  iconBubble: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: '#f0ebff',
  },
  centeredActions: {
    alignItems: 'center',
  },
  outlineButton: {
    borderWidth: 1,
    borderColor: 'rgba(106,54,213,0.35)',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  outlineButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6a36d5',
  },
  buttonPressed: {
    opacity: 0.85,
  },
})
